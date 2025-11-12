import React, { useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllVouchers, deleteVoucher } from '../../../features/payment/paymentSlice';
import { toast } from 'react-toastify';

const PaymentsCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: payments = [] } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchAllVouchers());
  }, [dispatch]);

  const handleAddPayment = () => {
    navigate('/payments-form');
  };

  const handleInvoiceClick = (payment) => {
    navigate(`/invoice-view/${payment._id}`);
  };

  const handleEdit = (payment, e) => {
    e.stopPropagation(); // prevent row click navigation
    navigate(`/payments-form/${payment._id}`);
  };

  const handleDelete = async (paymentId, e) => {
    e.stopPropagation(); // prevent row click navigation
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await dispatch(deleteVoucher(paymentId)).unwrap();
        toast.success('Payment deleted successfully');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete payment');
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Submitted Payments</Typography>
        <Button variant="contained" onClick={handleAddPayment}>
          + Add Payment
        </Button>
      </Box>

      {payments.length === 0 ? (
        <Typography>No payment records found.</Typography>
      ) : (
        <>
          {/* Header Row */}
          <Box
            display="flex"
            fontWeight="bold"
            bgcolor="#f0f0f0"
            p={1}
            borderBottom="1px solid #ccc"
          >
            <Box flex={0.5}>S.No</Box>
            <Box flex={1}>Receipt</Box>
            <Box flex={1}>Invoice</Box>
            <Box flex={1.5}>Name</Box>
            <Box flex={2}>Particulars</Box>
            <Box flex={1}>Dr/Cr</Box>
            <Box flex={1}>Transaction Id</Box>
            <Box flex={1}>Amount</Box>
            <Box flex={1}>Actions</Box>
          </Box>

          {/* Data Rows */}
          {payments.map((payment, index) => (
            <Box
              key={payment._id || index}
              display="flex"
              p={1}
              borderBottom="1px solid #eee"
              alignItems="center"
              onClick={() => handleInvoiceClick(payment)}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f9f9f9' },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box flex={0.5}>{String(index + 1).padStart(2, '0')}</Box>
              <Box flex={1}>{payment.receiptNumber || '-'}</Box>
              <Box flex={1}>{payment.invoice || '-'}</Box>
              <Box flex={1.5}>{payment.partyName}</Box>
              <Box flex={2}>{payment.particulars}</Box>
              <Box flex={1}>{payment.drCr}</Box>
              <Box flex={1}>{payment.referenceNumber}</Box>
              <Box flex={1}>₹{payment.amount}</Box>

              {/* Action Buttons */}
              <Box flex={1} display="flex" justifyContent="center" gap={1}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={(e) => handleEdit(payment, e)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => handleDelete(payment._id, e)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default PaymentsCard;
