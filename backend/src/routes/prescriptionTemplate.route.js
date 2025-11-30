const express = require('express');
const templateRouter = express.Router();
const { createTemplate, getTemplates, deleteTemplate } = require('../controllers/prescriptionTemplate.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

templateRouter.use(protect);

templateRouter.post('/', authorize('DOCTOR', 'HOSPITAL_ADMIN'), createTemplate);
templateRouter.get('/', authorize('DOCTOR', 'HOSPITAL_ADMIN'), getTemplates);
templateRouter.delete('/:id', authorize('DOCTOR', 'HOSPITAL_ADMIN'), deleteTemplate);

module.exports = templateRouter;
