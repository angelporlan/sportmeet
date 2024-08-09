const express = require('express');
const Event = require('../models/event');
const User = require('../models/user');
const router = express.Router();

router.post('/events', async (req, res) => {
  const { sport, location, date, time, maxParticipants, isPrivate, password, createdBy } = req.body;

  try {
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const event = new Event({
      sport,
      location,
      date,
      time,
      maxParticipants,
      isPrivate,
      password,
      createdBy
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().populate('participants createdBy');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('participants createdBy');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/events/:id', async (req, res) => {
  const { sport, location, date, time, maxParticipants, isPrivate, password } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.sport = sport || event.sport;
    event.location = location || event.location;
    event.date = date || event.date;
    event.time = time || event.time;
    event.maxParticipants = maxParticipants || event.maxParticipants;
    event.isPrivate = isPrivate || event.isPrivate;
    event.password = password || event.password;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/events/:id/participants', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isPrivate && event.password !== password) {
      return res.status(403).json({ message: 'Incorrect password for private event' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'User already enrolled' });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.participants.push(userId);
    await event.save();

    user.events.push(event._id);
    await user.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/events/:id/participants', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('participants');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event.participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
