import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Transaction from '../models/Transaction.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { amount, currency = 'USD', description } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Generate unique transaction ID
    const transactionId = uuidv4();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      transactionId,
      amount,
      currency,
      description,
      merchantInfo: {
        name: 'MERN Google Pay Store',
        id: 'mern-store-001'
      },
      status: 'pending'
    });

    await transaction.save();

    // Google Pay payment request configuration
    const paymentRequest = {
      transactionId,
      amount: {
        value: amount.toString(),
        currency
      },
      merchantInfo: {
        merchantName: 'MERN Google Pay Store',
        merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || 'BCR2DN4T2XFGJUXW'
      },
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }
      ],
      shippingAddressRequired: false,
      emailRequired: true
    };

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      transactionId,
      paymentRequest
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Process payment
router.post('/process-payment', authMiddleware, async (req, res) => {
  try {
    const { transactionId, paymentData } = req.body;

    // Validation
    if (!transactionId || !paymentData) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and payment data are required'
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ 
      transactionId,
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Simulate payment processing
    // In production, you would integrate with actual payment processors
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

    if (isPaymentSuccessful) {
      // Update transaction status
      transaction.status = 'completed';
      transaction.googlePayTransactionId = paymentData.transactionId || uuidv4();
      transaction.metadata.paymentToken = paymentData.paymentMethodData?.tokenizationData?.token || 'demo-token';
      await transaction.save();

      res.json({
        success: true,
        message: 'Payment processed successfully',
        transaction: {
          id: transaction.transactionId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          completedAt: transaction.updatedAt
        }
      });
    } else {
      // Payment failed
      transaction.status = 'failed';
      transaction.metadata.failureReason = 'Payment processing failed';
      await transaction.save();

      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        transaction: {
          id: transaction.transactionId,
          status: transaction.status
        }
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allTransactions = await Transaction.find({ userId: req.user.userId });
    const sortedTransactions = allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const transactions = sortedTransactions.slice(skip, skip + limit);

    const totalTransactions = await Transaction.countDocuments({ userId: req.user.userId });

    res.json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNext: page < Math.ceil(totalTransactions / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Transaction history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific transaction
router.get('/transactions/:transactionId', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ 
      transactionId,
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;