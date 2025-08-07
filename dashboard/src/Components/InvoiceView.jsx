import React from 'react';
import {
    Box,
    Typography,
    Divider,
    Grid,
    Paper,
    Stack,
    Link
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toWords } from 'number-to-words';
import logo from '../assets/logo.png';

const InvoiceView = () => {
    const location = useLocation();
    const payment = location.state?.payment;

    if (!payment) {
        return <Typography>No data found</Typography>;
    }

    const {
        partyName,
        country = 'India',
        receipt,
        amount,
        type,
        date = new Date().toLocaleDateString('en-GB'),
        particulars,
        paymentMode,
    } = payment;

    const amountInWords = `${toWords(amount || 0)} only`.replace(/\b\w/g, c => c.toUpperCase());
    const isReceipt = type === 'Dr';

    return (
        <Box
            maxWidth="950px"
            mx="auto"
            my={5}
            component={Paper}
            elevation={4}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                fontFamily: 'Arial, sans-serif',
            }}
        >
            {/* Header Title */}
            <Typography
                variant="h4"
                align="center"
                fontWeight="bold"
                gutterBottom
                sx={{
                    textTransform: 'uppercase',
                    color: '#1976d2',
                    letterSpacing: 1,
                    mb: 2
                }}
            >
                {isReceipt ? 'Receive Voucher' : 'Payment Voucher'}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Business Details */}
            <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                <Grid item xs={12} sm={6}>
                    <img src={logo} alt="Logo" style={{ height: 80 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box textAlign={{ xs: 'left', sm: 'right' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Iconic Yatra
                        </Typography>
                        <Typography>Noida - 201301, Uttar Pradesh</Typography>
                        <Typography>India</Typography>
                        <Typography>📞 +91 7053900957</Typography>
                        <Typography>✉️ info@iconicyatra.com</Typography>
                        <Typography color="primary">
                            🌐 <Link href="https://www.iconicyatra.com" target="_blank" rel="noopener noreferrer" color="primary" underline="hover">
                                www.iconicyatra.com
                            </Link>
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Received From */}
            <Stack spacing={0.5} mb={3}>
                <Typography variant="h6" fontWeight="bold">Received From</Typography>
                <Typography fontSize={16}>{partyName}</Typography>
                <Typography fontSize={15} color="text.secondary">{country}</Typography>
            </Stack>

            {/* Date & Receipt No */}
            <Grid container justifyContent="space-between" mb={3}>
                <Grid item>
                    <Typography><strong>Date:</strong> {date}</Typography>
                </Grid>
                <Grid item>
                    <Typography><strong>Receipt No:</strong> {receipt || '-'}</Typography>
                </Grid>
            </Grid>

            {/* Amount in Words + Amount */}
            <Box
                my={4}
                sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    border: '1px dashed #aaa',
                    p: 3,
                }}
            >
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <Typography fontWeight="bold" gutterBottom>Amount In Words</Typography>
                        <Typography>{amountInWords}</Typography>
                        <Typography fontSize={14} color="text.secondary">INR</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography
                            fontSize="2.5rem"
                            fontWeight="bold"
                            color="green"
                            textAlign={{ xs: 'left', sm: 'right' }}
                        >
                            ₹ {Number(amount).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Particulars */}
            <Box my={4}>
                <Typography fontWeight="bold" gutterBottom>Particulars</Typography>
                <Typography fontSize={16}>{particulars}</Typography>
            </Box>

            {/* Payment Mode */}
            <Box mb={4}>
                <Typography fontWeight="bold" gutterBottom>Payment Mode</Typography>
                <Typography fontSize={16}>{paymentMode}</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Footer Signature */}
            <Grid container justifyContent="space-between" alignItems="center" mt={6}>
                <Grid item>
                    <Typography fontSize={15}>For, <strong>Iconic Yatra</strong></Typography>
                </Grid>
                <Grid item>
                    <Typography fontWeight="bold" fontSize={15} textAlign="right">
                        Authorized Signatory
                    </Typography>
                </Grid>
            </Grid>

            {/* Optional Footer Info */}
            <Box textAlign="center" mt={6}>
                <Typography variant="caption" color="gray">
                    Powered by Iconic Yatra Billing System
                </Typography>
            </Box>
        </Box>
    );
};

export default InvoiceView;
