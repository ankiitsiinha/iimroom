# Use the official Python base image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the Python requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python code into the container
COPY . .

# Expose the desired port
EXPOSE 80

# Run the Python script
CMD ["python", "main.py"]

