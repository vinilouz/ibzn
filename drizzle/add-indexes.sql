CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_participant_id ON payments(participant_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_participant_id ON course_enrollments(participant_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher);
CREATE INDEX IF NOT EXISTS idx_courses_room ON courses(room);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_facilitators_name ON facilitators(name);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

CREATE INDEX IF NOT EXISTS idx_events_start ON events(start);
