// This file defines the database schema for Supabase

export const schema = {
  users: `
    id uuid references auth.users primary key,
    email text not null,
    level integer not null default 1,
    xp integer not null default 0,
    gold integer not null default 0,
    total_workouts integer not null default 0,
    total_duration integer not null default 0,
    created_at timestamp with time zone default now()
  `,

  exercises: `
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    muscle_group text not null,
    type text not null,
    description text not null,
    difficulty integer not null,
    xp_per_set integer not null,
    gold_per_set integer not null
  `,

  workouts: `
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users not null,
    date timestamp with time zone default now(),
    duration integer not null,
    total_xp integer not null,
    total_gold integer not null,
    completed boolean not null default false
  `,

  workout_exercises: `
    id uuid primary key default uuid_generate_v4(),
    workout_id uuid references workouts not null,
    exercise_id uuid references exercises not null,
    sets integer not null,
    reps integer,
    weight numeric,
    duration integer,
    distance numeric,
    xp_earned integer not null,
    gold_earned integer not null
  `,
}

// SQL to create the tables
export const createTables = `
  -- Enable UUID extension
  create extension if not exists "uuid-ossp";

  -- Create users table
  create table if not exists users (
    ${schema.users}
  );

  -- Create exercises table
  create table if not exists exercises (
    ${schema.exercises}
  );

  -- Create workouts table
  create table if not exists workouts (
    ${schema.workouts}
  );

  -- Create workout_exercises table
  create table if not exists workout_exercises (
    ${schema.workout_exercises}
  );
`

