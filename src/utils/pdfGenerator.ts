import jsPDF from 'jspdf';
import { StudentResult } from '../types';

export const generateStudentResultPDF = (studentResult: StudentResult, academicYear: string): void => {
  const doc = new jsPDF();
  
  // School header
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('J. R. PREPARATORY SCHOOL', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Academic Excellence Through Innovation', 105, 30, { align: 'center' });
  doc.text('Phone: +92-21-1234567 | Email: info@jrprep.edu.pk', 105, 37, { align: 'center' });
  
  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Result type and academic year
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  const resultTitle = studentResult.resultType === 'half-yearly' ? 'HALF YEARLY RESULT' : 'ANNUAL RESULT';
  doc.text(resultTitle, 105, 55, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Academic Year: ${academicYear}`, 105, 65, { align: 'center' });
  
  // Student details
  const student = studentResult.student;
  doc.text(`Student Name: ${student.name}`, 20, 80);
  doc.text(`Roll Number: ${student.rollNumber}`, 20, 90);
  doc.text(`Class: ${student.class}`, 20, 100);
  doc.text(`Section: ${student.section}`, 20, 110);
  doc.text(`Father's Name: ${student.fatherName}`, 110, 80);
  doc.text(`Mother's Name: ${student.motherName}`, 110, 90);
  doc.text(`Date of Birth: ${student.dateOfBirth}`, 110, 100);
  doc.text(`Phone: ${student.phone}`, 110, 110);
  
  // Table header
  let yPosition = 125;
  doc.setFillColor(0, 102, 204);
  doc.rect(20, yPosition, 170, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  
  if (studentResult.resultType === 'half-yearly') {
    doc.text('Subject', 25, yPosition + 7);
    doc.text('Term 1 Assign', 65, yPosition + 7);
    doc.text('Half Yearly', 105, yPosition + 7);
    doc.text('Total', 140, yPosition + 7);
    doc.text('Grade', 170, yPosition + 7);
  } else {
    doc.text('Subject', 25, yPosition + 7);
    doc.text('Assignments', 55, yPosition + 7);
    doc.text('Half Yearly', 85, yPosition + 7);
    doc.text('Final', 115, yPosition + 7);
    doc.text('Total', 140, yPosition + 7);
    doc.text('Grade', 170, yPosition + 7);
  }
  
  // Table rows
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  
  // Group grades by subject
  const subjectGrades = new Map();
  studentResult.grades.forEach(grade => {
    if (!subjectGrades.has(grade.subjectId)) {
      subjectGrades.set(grade.subjectId, {
        term1Assignments: [],
        term2Assignments: [],
        halfYearly: null,
        final: null
      });
    }
    
    const subjectData = subjectGrades.get(grade.subjectId);
    if (grade.examType === 'assignment') {
      if (grade.remarks?.includes('Term 1')) {
        subjectData.term1Assignments.push(grade);
      } else if (grade.remarks?.includes('Term 2')) {
        subjectData.term2Assignments.push(grade);
      }
    } else if (grade.examType === 'half-yearly') {
      subjectData.halfYearly = grade;
    } else if (grade.examType === 'final') {
      subjectData.final = grade;
    }
  });
  
  let rowIndex = 0;
  studentResult.subjects.forEach(subject => {
    const subjectData = subjectGrades.get(subject.id);
    if (subjectData) {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPosition - 7, 170, 10, 'F');
      }
      
      const term1AssignmentTotal = subjectData.term1Assignments.reduce((sum: number, g: any) => sum + g.marksObtained, 0);
      const term2AssignmentTotal = subjectData.term2Assignments.reduce((sum: number, g: any) => sum + g.marksObtained, 0);
      const halfYearlyMarks = subjectData.halfYearly?.marksObtained || 0;
      const finalMarks = subjectData.final?.marksObtained || 0;
      
      let totalMarks = 0;
      let examMarks = 0;
      
      if (studentResult.resultType === 'half-yearly') {
        totalMarks = term1AssignmentTotal + halfYearlyMarks;
        examMarks = halfYearlyMarks;
      } else {
        totalMarks = term1AssignmentTotal + term2AssignmentTotal + halfYearlyMarks + finalMarks;
        examMarks = halfYearlyMarks + finalMarks;
      }
      
      // Calculate percentage based on exam marks only (assignments are bonus)
      const examTotalPossible = studentResult.resultType === 'half-yearly' 
        ? subject.maxMarks 
        : subject.maxMarks * 2;
      
      const percentage = examTotalPossible > 0 ? (examMarks / examTotalPossible) * 100 : 0;
      const gradeText = getGradeText(percentage);
      
      doc.text(subject.name, 25, yPosition);
      
      if (studentResult.resultType === 'half-yearly') {
        doc.text(`${term1AssignmentTotal}/40`, 65, yPosition);
        doc.text(`${halfYearlyMarks}/${subject.maxMarks}`, 105, yPosition);
        doc.text(totalMarks.toString(), 140, yPosition);
        doc.text(gradeText, 170, yPosition);
      } else {
        const allAssignments = term1AssignmentTotal + term2AssignmentTotal;
        doc.text(`${allAssignments}/80`, 55, yPosition);
        doc.text(`${halfYearlyMarks}/${subject.maxMarks}`, 85, yPosition);
        doc.text(`${finalMarks}/${subject.maxMarks}`, 115, yPosition);
        doc.text(totalMarks.toString(), 140, yPosition);
        doc.text(gradeText, 170, yPosition);
      }
      
      yPosition += 10;
      rowIndex++;
    }
  });
  
  // Summary
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('SUMMARY', 20, yPosition);
  
  yPosition += 10;
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Marks: ${studentResult.totalMarks}`, 20, yPosition);
  doc.text(`Obtained Marks: ${studentResult.obtainedMarks}`, 20, yPosition + 10);
  doc.text(`Percentage: ${studentResult.percentage.toFixed(2)}%`, 20, yPosition + 20);
  doc.text(`Grade: ${studentResult.grade}`, 20, yPosition + 30);
  doc.text(`Status: ${studentResult.status.toUpperCase()}`, 20, yPosition + 40);
  
  // Assignment breakdown
  yPosition += 55;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  if (studentResult.resultType === 'half-yearly') {
    doc.text('Note: Half Yearly Result includes 2 Term 1 Assignments (40 marks) + Half Yearly Examination.', 20, yPosition);
    doc.text('Percentage calculated based on examination marks only. Assignments are additional.', 20, yPosition + 7);
  } else {
    doc.text('Note: Annual Result includes 4 Assignments (80 marks) + Half Yearly + Final Examinations.', 20, yPosition);
    doc.text('Percentage calculated based on examination marks only. Assignments are additional.', 20, yPosition + 7);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 280);
  doc.text('J. R. Preparatory School - Student Result Management System', 105, 280, { align: 'center' });
  
  // Save the PDF
  const resultTypeText = studentResult.resultType === 'half-yearly' ? 'HalfYearly' : 'Annual';
  doc.save(`${student.name}_${student.rollNumber}_${resultTypeText}_${academicYear}.pdf`);
};

const getGradeText = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};