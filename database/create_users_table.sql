-- Users Table for Admin Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store bcrypt hashed passwords
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users (email);

-- Create trigger for updated_at column
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


INSERT INTO users (full_name, email, password, role) VALUES 
('Admin Max', 'maxim.degtiarev.dev@gmail.com', '$2b$10$rQZ8K9mN2pL1vX3yU6wA7eB4cD5fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY7z', 'admin'); 