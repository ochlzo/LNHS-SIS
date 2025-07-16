const express = require("express");
const router = express.Router();
const { STUDENTS_T, USERS_T, DEPARTMENT_T, ACADEMIC_INFO_T } = require("../models");
const { Op } = require("sequelize");

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    // Get total students (only active ones)
    const totalStudents = await STUDENTS_T.count({
      where: {
        status: 'active'
      }
    });

    // Get active students (those with current academic info)
    const currentYear = new Date().getFullYear();
    const activeStudents = await ACADEMIC_INFO_T.findAll({
      attributes: ['student_id'],
      where: {
        schoolYear: {
          [Op.like]: `${currentYear}-${currentYear + 1}`
        },
        exitStatus: {
          [Op.notIn]: ['Dropped', 'Transferred Out']
        }
      },
      distinct: true,
      raw: true // Add this to get plain objects
    });

    // Get total departments
    const totalDepartments = await DEPARTMENT_T.count();

    // Get total users (only active ones)
    const totalUsers = await USERS_T.count({
      where: {
        status: 1 // This matches the TINYINT(1) in the model
      }
    });

    // Log the results for debugging
    console.log('Dashboard Stats:', {
      totalStudents,
      activeStudentsCount: activeStudents.length,
      totalDepartments,
      totalUsers
    });

    // Send response with proper error handling
    res.json({
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents.length || 0,
      totalDepartments: totalDepartments || 0,
      totalUsers: totalUsers || 0
    });
  } catch (error) {
    // Enhanced error logging
    console.error("Error fetching dashboard stats:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Send error response with more details
    res.status(500).json({ 
      message: "Error fetching dashboard statistics",
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 