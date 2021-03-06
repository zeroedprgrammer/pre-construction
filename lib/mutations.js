'use strict'

const pool = require('./db')
const errorHandler = require('./errorHandler')
var uuid = require('uuid-random');

module.exports = {
   createCourse: async (root, { input })  => {
      let defaults = {
         teacher: '',
         topic: ''
      }

      const newCourse = Object.assign(defaults, input)
      console.log('newCourse',newCourse)
      let course

      try {
         const uid = uuid()
         const { title, teacher, description, topic, level } = newCourse
         console.log(title, teacher, description, topic)
         const client = await pool.connect()
         const { rows } = await client.query('INSERT INTO course (uuid_course,title,teacher,description,topic,level) values ($1, $2, $3, $4, $5, $6)  returning *', [uid, title, teacher, description, topic, level])
         course = rows[0]

      } catch (error) {
          errorHandler(error)
      }
      return course
   },
   editCourse: async (root, { uuid_course, input } ) => {
      let course
      try {
         const { title, teacher, description, topic } = input   
         const client = await pool.connect()
         const { rows } = await client.query('UPDATE course SET title=$2, teacher=$3, description=$4, topic=$5, level=$6 WHERE uuid_course=$1 returning *',[
            uuid_course, title, teacher, description, topic, level
         ])
         course = rows[0]
      } catch (error) {
         errorHandler(error)
      }
      return course
   },
   deleteCourse: async (root, { uuid_course }) => {
      let isDeleted
      try {
         const client = await pool.connect()
         const { rowCount } = await client.query('DELETE FROM course WHERE uuid_course=$1',[uuid_course])         
         isDeleted = rowCount
      } catch (error) {
         console.log(error)
      }
      return isDeleted
   },
   createPerson: async (root, { input })  => {
      let student
      try {
         const uid = uuid()
         const { name, email, phone, avatar } = input
         const client = await pool.connect()
         const { rows } = await client.query('INSERT INTO student (uuid_student,name,email,phone,avatar) values ($1, $2, $3, $4, $5)  returning *', [uid, name, email, phone, avatar])
         student = rows[0]

      } catch (error) {
          errorHandler(error)
      }
      return student
   },
   editPerson: async (root, { uuid_student, input } ) => {
      let student
      try {
         const { name, email } = input   
         const client = await pool.connect()
         const { rows } = await client.query('UPDATE student SET name=$2, email=$3 WHERE uuid_student=$1 returning *',[
            uuid_student, name, email
         ])
         student = rows[0]
      } catch (error) {
         errorHandler(error)
      }
      return student
   },
   deletePerson: async (root, { uuid_student }) => {
      let isDeleted
      try {
         const client = await pool.connect()
         const { rowCount } = await client.query('DELETE FROM student WHERE uuid_student=$1',[uuid_student])         
         isDeleted = rowCount
      } catch (error) {
         console.log(error)
      }
      return isDeleted
   },
   addPeople: async (root, { uuid_course, uuid_student }) => {
      let course
      let student
      try {
         const client = await pool.connect()
         let r_course = await client.query('SELECT * FROM course WHERE uuid_course=$1',[uuid_course])
         course = (r_course.rowCount>0) ? r_course.rows[0] : undefined

         let r_student = await client.query('SELECT uuid_student FROM student WHERE uuid_student=$1',[uuid_student])
         student = (r_student.rowCount>0) ? r_student.rows[0] : undefined

         if(!course || !student) throw new Error('The Student or Course dont exist!')

         console.log('student',student)
         console.log('uuid_student',uuid_student)

         let { rows } = await client.query(`UPDATE course SET students = COALESCE(students,'[]')  || $2  WHERE uuid_course = $1 returning *`,[
            uuid_course, student 
         ])
         course = rows[0]

      } catch (error) {
         console.log(error)
      }
      return course
   }
} 