const PrescriptionTemplate = require('../models/prescriptionTemplate.model.js');

/**
 * @desc    Create a new Prescription Template
 * @route   POST /api/prescription-templates
 * @access  Private (Doctor)
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, medicines } = req.body;

    if (!name || !medicines || medicines.length === 0) {
      const error = new Error('Name and at least one medicine are required');
      error.statusCode = 400;
      throw error;
    }

    const TenantTemplate = req.tenantDB.model('PrescriptionTemplate', PrescriptionTemplate.schema);

    const template = await TenantTemplate.create({
      name,
      medicines,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Prescription Templates
 * @route   GET /api/prescription-templates
 * @access  Private (Doctor)
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const TenantTemplate = req.tenantDB.model('PrescriptionTemplate', PrescriptionTemplate.schema);

    const templates = await TenantTemplate.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Prescription Template
 * @route   DELETE /api/prescription-templates/:id
 * @access  Private (Doctor)
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const TenantTemplate = req.tenantDB.model('PrescriptionTemplate', PrescriptionTemplate.schema);

    const template = await TenantTemplate.findById(req.params.id);

    if (!template) {
      const error = new Error('Template not found');
      error.statusCode = 404;
      throw error;
    }

    if (template.tenantId !== req.user.tenantId) {
      const error = new Error('Not authorized to delete this template');
      error.statusCode = 403;
      throw error;
    }

    await TenantTemplate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
