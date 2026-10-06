import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

// Helper to round to 2 decimal places
const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * @desc    Calculate exact pairwise balances among all household users
 * @route   GET /api/balances
 */
export const getBalances = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : null;

    // Fetch all users, expenses, and settlements concurrently
    const [users, expenses, settlements] = await Promise.all([
      User.find({}).select('_id name email avatarColor'),
      Expense.find({}),
      Settlement.find({}),
    ]);

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = {
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        avatarColor: u.avatarColor,
      };
    });

    const userIds = users.map((u) => u._id.toString());

    // Initialize 2D debt matrix: debts[A][B] = how much A owes B
    const debts = {};
    userIds.forEach((uA) => {
      debts[uA] = {};
      userIds.forEach((uB) => {
        debts[uA][uB] = 0;
      });
    });

    // 1. Process Expenses
    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();
      const splitBetween = (expense.splitBetween || []).map((id) => id.toString());

      if (splitBetween.length === 0) return;

      const perPersonShare = expense.amount / splitBetween.length;

      splitBetween.forEach((participantId) => {
        if (participantId !== payerId && debts[participantId] && debts[participantId][payerId] !== undefined) {
          debts[participantId][payerId] += perPersonShare;
        }
      });
    });

    // 2. Process Settlements (debt repayments)
    settlements.forEach((settlement) => {
      const payerId = settlement.payer.toString();
      const receiverId = settlement.receiver.toString();
      const amount = settlement.amount;

      // When payer pays receiver, reduce payer's debt to receiver
      if (debts[payerId] && debts[payerId][receiverId] !== undefined) {
        debts[payerId][receiverId] -= amount;
      }
    });

    // 3. Compute net pairwise balances for every unique pair (uA, uB)
    const pairs = [];
    const myBalances = [];
    let myTotalOwed = 0; // Money others owe me
    let myTotalOwe = 0;  // Money I owe others

    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        const idA = userIds[i];
        const idB = userIds[j];
        const userA = userMap[idA];
        const userB = userMap[idB];

        if (!userA || !userB) continue;

        // Gross debts
        const aOwesB = debts[idA][idB];
        const bOwesA = debts[idB][idA];

        // Net: positive means B owes A; negative means A owes B
        const rawNet = bOwesA - aOwesB;
        const net = round2(rawNet);

        let status = 'settled';
        let debtor = null;
        let creditor = null;
        let amount = 0;
        let message = `${userA.name} and ${userB.name} are settled up`;

        if (net > 0.01) {
          status = 'userB_owes_userA';
          debtor = userB;
          creditor = userA;
          amount = net;
          message = `${userB.name} owes ${userA.name} ${amount.toLocaleString('en-US')} Ks`;
        } else if (net < -0.01) {
          status = 'userA_owes_userB';
          debtor = userA;
          creditor = userB;
          amount = Math.abs(net);
          message = `${userA.name} owes ${userB.name} ${amount.toLocaleString('en-US')} Ks`;
        }

        const pairObj = {
          pairId: `${idA}-${idB}`,
          userA,
          userB,
          netAmount: net,
          amount,
          status,
          debtor,
          creditor,
          message,
        };

        pairs.push(pairObj);

        // Perspective for logged-in user
        if (currentUserId && (idA === currentUserId || idB === currentUserId)) {
          const isUserA = idA === currentUserId;
          const otherUser = isUserA ? userB : userA;

          // From current user's perspective:
          // If isUserA: net > 0 means other owes me; net < 0 means I owe other
          // If isUserB: net > 0 means I owe other; net < 0 means other owes me
          const signedNetForMe = isUserA ? net : -net;

          let myStatus = 'settled';
          let myMessage = `You and ${otherUser.name} are all settled up!`;

          if (signedNetForMe > 0.01) {
            myStatus = 'owed';
            myMessage = `${otherUser.name} owes you ${Math.abs(signedNetForMe).toLocaleString('en-US')} Ks`;
            myTotalOwed += Math.abs(signedNetForMe);
          } else if (signedNetForMe < -0.01) {
            myStatus = 'owe';
            myMessage = `You owe ${otherUser.name} ${Math.abs(signedNetForMe).toLocaleString('en-US')} Ks`;
            myTotalOwe += Math.abs(signedNetForMe);
          }

          myBalances.push({
            otherUser,
            signedNet: round2(signedNetForMe),
            absAmount: round2(Math.abs(signedNetForMe)),
            status: myStatus,
            message: myMessage,
            canSettle: myStatus !== 'settled',
            settlePayer: myStatus === 'owe' ? userMap[currentUserId] : otherUser,
            settleReceiver: myStatus === 'owe' ? otherUser : userMap[currentUserId],
          });
        }
      }
    }

    const totalHouseholdSpend = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    res.json({
      success: true,
      pairs,
      mySummary: currentUserId
        ? {
            totalOwed: round2(myTotalOwed),
            totalOwe: round2(myTotalOwe),
            netBalance: round2(myTotalOwed - myTotalOwe),
            pairwise: myBalances,
          }
        : null,
      totalHouseholdSpend: round2(totalHouseholdSpend),
      totalExpensesCount: expenses.length,
      totalSettlementsCount: settlements.length,
    });
  } catch (error) {
    console.error('Balance calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate balances',
    });
  }
};
