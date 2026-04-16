const mongoose = require('mongoose');

async function syncTargeting() {
  try {
    await mongoose.connect('mongodb://localhost:27017/placement-portal');
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const jobs = await db.collection('jobopenings').find({}).toArray();
    console.log(`Found ${jobs.length} jobs`);

    for (const job of jobs) {
      const update = {};
      
      // Migrate singular course to plural array
      if (job.receivingCourse && (!job.receivingCourses || job.receivingCourses.length === 0)) {
        update.receivingCourses = [job.receivingCourse];
      }
      
      // Ensure batch is array
      if (job.receivingBatch && !Array.isArray(job.receivingBatch)) {
        update.receivingBatch = [job.receivingBatch];
      }
      
      // Ensure depts is array
      if (job.receivingDepartments && !Array.isArray(job.receivingDepartments)) {
        update.receivingDepartments = [job.receivingDepartments];
      }

      if (Object.keys(update).length > 0) {
        await db.collection('jobopenings').updateOne({ _id: job._id }, { $set: update });
        console.log(`Synced Job: ${job.profile}`);
      }
    }

    console.log('Syncing users...');
    const users = await db.collection('users').find({ role: 'student' }).toArray();
    for (const user of users) {
      const update = {};
      if (user.courseId && typeof user.courseId === 'string') update.courseId = new mongoose.Types.ObjectId(user.courseId);
      if (user.batchId && typeof user.batchId === 'string') update.batchId = new mongoose.Types.ObjectId(user.batchId);
      if (user.departmentId && typeof user.departmentId === 'string') update.departmentId = new mongoose.Types.ObjectId(user.departmentId);
      
      if (Object.keys(update).length > 0) {
        await db.collection('users').updateOne({ _id: user._id }, { $set: update });
        console.log(`Synced User: ${user.name}`);
      }
    }

    console.log('Full Sync Complete');
    process.exit(0);
  } catch (err) {
    console.error('Sync Error:', err);
    process.exit(1);
  }
}

syncTargeting();
