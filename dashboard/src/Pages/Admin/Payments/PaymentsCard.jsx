import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {useDispatch,useSelector} from "react-redux";
import {fetchAllVouchers} from "../../../features/payment/paymentSlice"
const PaymentsCard = () => {
    const navigate = useNavigate();
  
    const {list:payments=[]}=useSelector((state)=>state.payment)
    const dispatch = useDispatch();
   useEffect(()=>{
    dispatch(fetchAllVouchers())
   },[dispatch]);

    const handleAddPayment = () => {
        navigate('/payments-form');
    };

    const handleInvoiceClick = (payment) => {
        navigate('/invoice-view', { state: { payment } });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Submitted Payments</Typography>
                <Button variant="contained" onClick={handleAddPayment}>+ Add Payment</Button>
            </Box>

            {payments.length === 0 ? (
                <Typography>No payment records found.</Typography>
            ) : (
                <>
                    <Box display="flex" fontWeight="bold" bgcolor="#f0f0f0" p={1} borderBottom="1px solid #ccc">
                        <Box flex={0.5}>S.No</Box>
                        <Box flex={1}>Receipt</Box>
                        <Box flex={1}>Invoice</Box>
                        <Box flex={1.5}>Name</Box>
                        <Box flex={2}>Particulars</Box>
                        <Box flex={1}>Dr/Cr</Box>
                        <Box flex={1}>Transition Id:</Box>
                        <Box flex={1}>Amount</Box>
                    </Box>

                    {payments.map((payment, index) => (
                        <Box
                            key={index}
                            display="flex"
                            p={1}
                            borderBottom="1px solid #eee"
                            alignItems="center"
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}
                            onClick={() => handleInvoiceClick(payment)}
                        >
                            <Box flex={0.5}>{String(index + 1).padStart(2, '0')}</Box>
                            <Box flex={1}>{payment.receipt || '-'}</Box>
                            <Box flex={1}>{payment.invoice || '-'}</Box>
                            <Box flex={1.5}>{payment.partyName}</Box>
                            <Box flex={2}>{payment.particulars}</Box>
                            <Box flex={1}>{payment.drCr}</Box>
                            <Box flex={1}>{payment.reference}</Box>
                            <Box flex={1}>₹{payment.amount}</Box>
                        </Box>
                    ))}
                </>
            )}
        </Box>
    );
};

export default PaymentsCard;