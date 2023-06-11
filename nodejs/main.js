const express = require('express');
const app = express();
const csv = require('csv-parser');
const fs = require('fs');
const random = require('random');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let maleBlocks = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B4'];
let femaleBlocks = ['B3', 'C1', 'C2', 'C3'];
let maleRooms = [];
let femaleRooms = [];

// Create the rooms array with beds for male and female blocks separately
maleBlocks.forEach((block) => {
  let rooms = [];
  for (let i = 1; i < 25; i++) {
    if (i === 1) {
      rooms.push({ number: i, bed: '' });
    } else {
      rooms.push({ number: i, bed: 'A' });
      rooms.push({ number: i, bed: 'B' });
    }
  }
  maleRooms.push(rooms);
});

femaleBlocks.forEach((block) => {
  let rooms = [];
  for (let i = 1; i < 25; i++) {
    if (i === 1) {
      rooms.push({ number: i, bed: '' });
    } else {
      rooms.push({ number: i, bed: 'A' });
      rooms.push({ number: i, bed: 'B' });
    }
  }
  femaleRooms.push(rooms);
});

let participants = {};
let currentBlockIndex = 0;

function assignRoom(registrationId, gender) {
  // Check if the participant has already been assigned a room
  if (participants.hasOwnProperty(registrationId)) {
    return `Registration ID ${registrationId} has already been assigned a room.`;
  }

  let blocks, availableRooms;

  // Assign the block and rooms based on gender
  if (gender.toLowerCase() === 'male') {
    blocks = maleBlocks;
    availableRooms = maleRooms[currentBlockIndex];
  } else if (gender.toLowerCase() === 'female') {
    blocks = femaleBlocks;
    availableRooms = femaleRooms[currentBlockIndex];
  } else {
    return `Invalid gender specified for Registration ID ${registrationId}.`;
  }

  // Check if there are available rooms in the current block
  if (availableRooms.length === 0) {
    currentBlockIndex++;
    if (currentBlockIndex >= blocks.length) {
      return `No rooms available in any blocks for Registration ID ${registrationId}.`;
    } else {
      availableRooms =
        gender.toLowerCase() === 'male'
          ? maleRooms[currentBlockIndex]
          : femaleRooms[currentBlockIndex];
    }
  }

  // Randomly select a room
  const randomIndex = random.int(0, availableRooms.length - 1);
  const room = availableRooms[randomIndex];
  const { number, bed } = room;

  // Assign the block and add to the participants list
  const block = blocks[currentBlockIndex];
  participants[registrationId] = { registrationId, number, bed, block, gender };

  // Remove the assigned room from the available rooms
  availableRooms.splice(randomIndex, 1);

  // Check if all rooms in the current block are assigned
  if (availableRooms.length === 0) {
    currentBlockIndex++;
    if (currentBlockIndex >= blocks.length) {
      return `Registration ID ${registrationId} has been assigned Room ${number}${bed} in Block ${block}. All blocks are fully assigned.`;
    } else {
      return `Registration ID ${registrationId} has been assigned Room ${number}${bed} in Block ${block}. Moving to the next block: ${blocks[currentBlockIndex]}.`;
    }
  }

  return `Registration ID ${registrationId} has been assigned Room ${number}${bed} in Block ${block}.`;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/assign-room', (req, res) => {
  const registrationId = req.body.registration_id;
  const gender = req.body.gender;
  const result = assignRoom(registrationId, gender);
  res.send(result);
});

app.get('/allotted-rooms', (req, res) => {
  res.render('allotted_rooms.ejs', { participants });
});

app.post('/clear-allotment', (req, res) => {
  const registrationId = req.body.registration_id;
  if (participants.hasOwnProperty(registrationId)) {
    delete participants[registrationId];
    res.redirect('/allotted-rooms');
  } else {
    res.status(404).send('Registration ID not found.');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

