const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI not found in .env file');
  process.exit(1);
}

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    const db = mongoose.connection.db;

    // Delete learners and tutors — keep admin
    const users = await db.collection('users').deleteMany({
      role: { $in: ['learner', 'tutor'] }
    });
    console.log(`Users deleted: ${users.deletedCount}`);

    // Delete all courses
    const courses = await db.collection('courses').deleteMany({});
    console.log(`Courses deleted: ${courses.deletedCount}`);

    // Delete all enrollments
    const enrollments = await db.collection('enrollments').deleteMany({});
    console.log(`Enrollments deleted: ${enrollments.deletedCount}`);

    // Delete all live sessions
    const livesessions = await db.collection('livesessions').deleteMany({});
    console.log(`Live sessions deleted: ${livesessions.deletedCount}`);

    // Delete all progress records
    const progresses = await db.collection('progresses').deleteMany({});
    console.log(`Progress records deleted: ${progresses.deletedCount}`);

    // Delete all reviews
    const reviews = await db.collection('reviews').deleteMany({});
    console.log(`Reviews deleted: ${reviews.deletedCount}`);

    // Delete all quiz attempts
    const quizzes = await db.collection('quizzes').deleteMany({});
    console.log(`Quiz attempts deleted: ${quizzes.deletedCount}`);

    console.log('\nCleanup complete. Admin account preserved.');
    console.log('Verify in MongoDB Atlas that admin still exists.');

  } catch (err) {
    console.error('Cleanup failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

cleanup();