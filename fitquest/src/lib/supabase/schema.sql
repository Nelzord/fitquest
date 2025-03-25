-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  email TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  total_workouts INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_workout_date TIMESTAMP WITH TIME ZONE,
  avatar_color TEXT DEFAULT 'blue',
  avatar_accessory TEXT DEFAULT 'none',
  avatar_outfit TEXT DEFAULT 'tank-top',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Table (predefined exercise library)
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

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL, -- in minutes
  total_xp INTEGER NOT NULL,
  total_gold INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Exercises Table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts NOT NULL,
  exercise_id UUID REFERENCES exercises NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER, -- for strength exercises
  weight NUMERIC, -- for strength exercises (in kg)
  duration INTEGER, -- for cardio exercises (in minutes)
  distance NUMERIC, -- for cardio exercises (in km)
  xp_earned INTEGER NOT NULL,
  gold_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- User Stats Table (for historical tracking)
CREATE TABLE IF NOT EXISTS user_stats_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  date DATE NOT NULL,
  xp_gained INTEGER NOT NULL DEFAULT 0,
  gold_gained INTEGER NOT NULL DEFAULT 0,
  workouts_completed INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Muscle Group Stats Table (for radar chart)
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

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_muscle_stats ENABLE ROW LEVEL SECURITY;

-- Users policy
CREATE POLICY "Users can view and update their own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Workouts policy
CREATE POLICY "Users can CRUD their own workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id);

-- Workout exercises policy
CREATE POLICY "Users can CRUD their own workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- User achievements policy
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- User stats history policy
CREATE POLICY "Users can view their own stats history" ON user_stats_history
  FOR SELECT USING (auth.uid() = user_id);

-- User muscle stats policy
CREATE POLICY "Users can view and update their own muscle stats" ON user_muscle_stats
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_stats_history_user_id_date_idx ON user_stats_history(user_id, date);

