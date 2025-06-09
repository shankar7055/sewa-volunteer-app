-- Create initial admin user
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Admin User',
  'admin@sewa.org',
  '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', -- password is 'password'
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sample volunteers
INSERT INTO "Volunteer" (id, name, email, phone, address, skills, availability, status, "createdAt", "updatedAt", "createdById")
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'John Doe',
    'john.doe@example.com',
    '1234567890',
    '123 Main St, City, State, 12345',
    ARRAY['teaching', 'driving'],
    ARRAY['weekday_morning', 'weekend_afternoon'],
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Jane Smith',
    'jane.smith@example.com',
    '9876543210',
    '456 Oak Ave, Town, State, 54321',
    ARRAY['cooking', 'medical', 'language'],
    ARRAY['weekday_evening', 'weekend_morning', 'on_call'],
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Bob Johnson',
    'bob.johnson@example.com',
    '5551234567',
    '789 Pine St, Village, State, 67890',
    ARRAY['technical', 'management'],
    ARRAY['weekday_afternoon', 'weekend_evening'],
    'inactive',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Alice Brown',
    'alice.brown@example.com',
    '7778889999',
    '321 Elm St, Suburb, State, 13579',
    ARRAY['counseling', 'teaching', 'language'],
    ARRAY['weekday_morning', 'weekday_afternoon', 'weekend_morning'],
    'pending',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Charlie Wilson',
    'charlie.wilson@example.com',
    '3334445555',
    '654 Maple Ave, City, State, 97531',
    ARRAY['driving', 'cooking', 'management'],
    ARRAY['weekday_evening', 'weekend_afternoon', 'on_call'],
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (email) DO NOTHING;

-- Create sample attendance records
INSERT INTO "Attendance" (id, "volunteerId", "checkInTime", "checkOutTime", duration, status, "createdAt", "updatedAt", "recordedById")
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
    180,
    'checked-out',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days' + INTERVAL '4 hours',
    240,
    'checked-out',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days' + INTERVAL '4 hours',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
    120,
    'checked-out',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
    300,
    'checked-out',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '3 hours',
    180,
    'checked-out',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '3 hours',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;

-- Create sample activities
INSERT INTO "Activity" (id, type, "volunteerId", details, timestamp, "recordedById")
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'check-in',
    '11111111-1111-1111-1111-111111111111',
    'Checked in',
    NOW() - INTERVAL '7 days',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'check-out',
    '11111111-1111-1111-1111-111111111111',
    'Checked out after 180 minutes',
    NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'new-volunteer',
    '44444444-4444-4444-4444-444444444444',
    'New volunteer registered',
    NOW() - INTERVAL '5 days',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'volunteer-update',
    '33333333-3333-3333-3333-333333333333',
    'Status changed from active to inactive',
    NOW() - INTERVAL '4 days',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'check-in',
    '22222222-2222-2222-2222-222222222222',
    'Checked in',
    NOW() - INTERVAL '1 day',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;
