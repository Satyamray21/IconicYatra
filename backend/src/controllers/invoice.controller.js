import Invoice from "../models/invoice.model.js";

// Create Invoice
export const createInvoice = async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        const saved = await invoice.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get All Invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Invoice
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update Invoice
export const updateInvoice = async (req, res) => {
    try {
        const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updated) return res.status(404).json({ message: "Invoice not found" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Invoice
export const deleteInvoice = async (req, res) => {
    try {
        const deleted = await Invoice.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Invoice not found" });
        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};