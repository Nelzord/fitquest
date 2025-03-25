-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  email TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  total_workouts INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_workout_date TIMESTAMP WITH TIME ZONE,
  avatar_color TEXT DEFAULT 'blue',
  avatar_accessory TEXT DEFAULT 'none',
  avatar_outfit TEXT DEFAULT 'tank-top',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  xp_per_set INTEGER NOT NULL,
  gold_per_set INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL,
  total_xp INTEGER NOT NULL,
  total_gold INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts NOT NULL,
  exercise_id UUID REFERENCES exercises NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC,
  duration INTEGER,
  distance NUMERIC,
  xp_earned INTEGER NOT NULL,
  gold_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create user stats table
CREATE TABLE IF NOT EXISTS user_stats_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  date DATE NOT NULL,
  xp_gained INTEGER NOT NULL DEFAULT 0,
  gold_gained INTEGER NOT NULL DEFAULT 0,
  workouts_completed INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create muscle group stats table
CREATE TABLE IF NOT EXISTS user_muscle_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  chest INTEGER NOT NULL DEFAULT 0,
  back INTEGER NOT NULL DEFAULT 0,
  legs INTEGER NOT NULL DEFAULT 0,
  shoulders INTEGER NOT NULL DEFAULT 0,
  arms INTEGER NOT NULL DEFAULT 0,
  core INTEGER NOT NULL DEFAULT 0,
  cardio INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_muscle_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view and update their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can CRUD their own workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats history" ON user_stats_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view and update their own muscle stats" ON user_muscle_stats
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_stats_history_user_id_date_idx ON user_stats_history(user_id, date);

-- Seed exercises
INSERT INTO exercises (name, muscle_group, type, description, difficulty, xp_per_set, gold_per_set)
VALUES
  ('Bench Press', 'chest', 'strength', 'Lie on a flat bench and press weight upward using a barbell or dumbbells.', 2, 10, 5),
  ('Push-Up', 'chest', 'strength', 'A bodyweight exercise where you push your body up from the ground.', 1, 8, 4),
  ('Squat', 'legs', 'strength', 'Lower your body by bending your knees and hips, then return to standing position.', 3, 15, 8),
  ('Deadlift', 'back', 'strength', 'A compound exercise that works multiple muscle groups by lifting a loaded barbell from the ground.', 3, 20, 10),
  ('Pull-Up', 'back', 'strength', 'Grip an overhead bar and pull your body upward until your chin is above the bar.', 3, 15, 8),
  ('Running', 'cardio', 'cardio', 'Run at a steady pace or intervals.', 2, 15, 8),
  ('Cycling', 'cardio', 'cardio', 'Ride a bicycle or stationary bike.', 2, 12, 6),
  ('Overhead Press', 'shoulders', 'strength', 'Press weight overhead from shoulder height.', 2, 12, 6),
  ('Bicep Curl', 'arms', 'strength', 'Curl weight toward your shoulders by bending at the elbow.', 1, 8, 4),
  ('Plank', 'core', 'strength', 'Hold a position similar to a push-up, but with your weight on your forearms.', 1, 10, 5)
ON CONFLICT (id) DO NOTHING;

