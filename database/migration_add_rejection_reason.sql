-- Migration script to add rejection_reason column to existing activities table
-- Run this if you have an existing database

-- Add rejection_reason column to activities table
ALTER TABLE activities ADD COLUMN rejection_reason TEXT AFTER status;

-- Verify the change
DESCRIBE activities;
