##
import csv
import random
from flask import Flask, render_template, request, redirect


app = Flask(__name__)

def assign_room(registration_id, gender):
    global current_block_index

    # Check if the participant has already been assigned a room
    for details in participants.values():
        if details[0] == registration_id:
            return f"Registration ID {registration_id} has already been assigned a room."

    # Assign the block and rooms based on gender
    if gender.lower() == 'male':
        blocks = male_blocks
        available_rooms = male_rooms[current_block_index]
    elif gender.lower() == 'female':
        blocks = female_blocks
        available_rooms = female_rooms[current_block_index]
    else:
        return f"Invalid gender specified for Registration ID {registration_id}."

    # Check if there are available rooms in the current block
    if len(available_rooms) == 0:
        current_block_index += 1
        if current_block_index >= len(blocks):
            return f"No rooms available in any blocks for Registration ID {registration_id}."
        else:
            available_rooms = male_rooms[current_block_index] if gender.lower() == 'male' else female_rooms[current_block_index]

    # Randomly select a room
    room = random.choice(available_rooms)
    room_number, bed = room[0], room[1]

    # Assign the block and add to the participants list
    block = blocks[current_block_index]
    participants[registration_id] = [registration_id, room_number, bed, block, gender]

    # Remove the assigned room from the available rooms
    available_rooms.remove(room)

    # Check if all rooms in the current block are assigned
    if len(available_rooms) == 0:
        current_block_index += 1
        if current_block_index >= len(blocks):
            return f"Registration ID {registration_id} has been assigned Room {room_number}{bed} in Block {block}. All blocks are fully assigned."
        else:
            return f"Registration ID {registration_id} has been assigned Room {room_number}{bed} in Block {block}. Moving to the next block: {blocks[current_block_index]}."

    return f"Registration ID {registration_id} has been assigned Room {room_number}{bed} in Block {block}."


# Define the blocks and rooms array
male_blocks = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B4']
female_blocks = ['B3', 'C1', 'C2', 'C3']
male_rooms = []
female_rooms = []

# Create the rooms array with beds for male and female blocks separately
for block in male_blocks:
    rooms = []
    for i in range(1, 25):
        if i == 1:
            rooms.append((i, ''))
        else:
            rooms.append((i, 'A'))
            rooms.append((i, 'B'))
    male_rooms.append(rooms)

for block in female_blocks:
    rooms = []
    for i in range(1, 25):
        if i == 1:
            rooms.append((i, ''))
        else:
            rooms.append((i, 'A'))
            rooms.append((i, 'B'))
    female_rooms.append(rooms)

# Create a dictionary to store the participants and their room information
participants = {}

# Variable to keep track of the current block index
current_block_index = 0

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        registration_id = request.form['registration_id']
        gender = request.form['gender']
        
        result = assign_room(registration_id, gender)
        return render_template('index.html', result=result)
    
    return render_template('index.html')

# Save the participants list to a CSV file
def save_participants_to_csv():
    with open('participants.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Registration ID', 'Room Number', 'Bed', 'Block', 'Gender'])
        for details in participants.values():
            writer.writerow(details)

@app.route('/allotted_rooms', methods=['GET', 'POST'])
def allotted_rooms():
    if request.method == 'POST':
        registration_id = request.form['registration_id']
        if registration_id in participants:
            del participants[registration_id]
            save_participants_to_csv()
        return render_template('allotted_rooms.html', participants=participants)
    return render_template('allotted_rooms.html', participants=participants)

@app.route('/allotted_rooms', methods=['POST'])
def clear_allotment():
    registration_id = request.form['registration_id']
    if registration_id in participants:
        del participants[registration_id]
        save_participants_to_csv()
    return render_template('allotted_rooms.html', participants=participants)

@app.route('/manual_allotment', methods=['POST'])
def manual_allotment():
    registration_id = request.form['manual_registration_id']
    gender = request.form['manual_gender']
    block = request.form['manual_block']
    room_number = request.form['manual_room']
    bed = request.form['manual_bed']

    # Check if the participant has already been assigned a room
    if registration_id in participants:
        return f"Registration ID {registration_id} has already been assigned a room."

    # Assign the block and add to the participants list
    participants[registration_id] = [registration_id, room_number, bed, block, gender]

    # Save the participants list to CSV
    save_participants_to_csv()

    return redirect('/allotted_rooms')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)

