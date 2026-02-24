const express = require('express');
const { requireAdmin } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { createInvite } = require('~/models/inviteUser');
const { sendEmail } = require('~/server/utils');
const middleware = require('~/server/middleware');
const { User } = require('~/db/models');

const router = express.Router();

router.use(middleware.requireJwtAuth, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await User.find(
      {},
      { name: 1, email: 1, role: 1, createdAt: 1 },
    ).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    logger.error('[admin/users] Error fetching users', error);
    res.status(500).json({ message: 'Fehler beim Laden der Benutzer' });
  }
});

router.post('/invite', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Ungültige E-Mail-Adresse' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Ein Benutzer mit dieser E-Mail existiert bereits' });
    }

    const token = await createInvite(email);
    const inviteLink = `${process.env.DOMAIN_CLIENT}/register?token=${token}`;
    const appName = process.env.APP_TITLE || 'KARRIERE.MUM AI';

    await sendEmail({
      email,
      subject: `Einladung zu ${appName}`,
      payload: {
        appName,
        inviteLink,
        name: name || '',
        year: new Date().getFullYear(),
      },
      template: 'inviteUser.handlebars',
    });

    res.status(200).json({ message: 'Einladung erfolgreich gesendet' });
  } catch (error) {
    logger.error('[admin/users/invite] Error sending invite', error);
    res.status(500).json({ message: 'Fehler beim Senden der Einladung' });
  }
});

module.exports = router;
