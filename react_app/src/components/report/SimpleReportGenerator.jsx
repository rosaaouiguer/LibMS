// SimpleReportGenerator.jsx - A more robust version with fewer dependencies
import React, { useState } from 'react';
import { Download } from 'lucide-react';

const SimpleReportGenerator = ({ data, dateRange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import jsPDF only when needed to prevent initialization errors
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      
      // Also import autoTable
      await import('jspdf-autotable');
      
      console.log("Libraries loaded successfully");
      
      // Create the PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      if (!doc) {
        throw new Error("PDF library failed to initialize");
      }
      
      // Basic document setup
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Add title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Library Management System - Analytics Report", pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Add date range
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Report Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Add key metrics
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Key Metrics", 10, yPos);
      yPos += 10;
      
      // Create a table for key metrics
      try {
        doc.autoTable({
          startY: yPos,
          head: [['Metric', 'Value']],
          body: [
            ['Total Books Loaned', '2,467'],
            ['Active Students', '856'],
            ['Low Stock Items', '17'],
            ['User Satisfaction', '4.7/5']
          ],
          theme: 'grid',
          headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
          margin: { left: 10, right: 10 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      } catch (tableError) {
        console.error("Error creating metrics table:", tableError);
        // Continue execution even if table fails
        yPos += 30;
      }
      
      // Add Low Stock Books section
      if (data && data.lowStockBooks && data.lowStockBooks.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Books Requiring Acquisition", 10, yPos);
        yPos += 10;
        
        try {
          const lowStockData = data.lowStockBooks.map(book => [
            book.title || 'Unknown',
            book.author || 'Unknown',
            book.category || 'Unspecified',
            book.copies || 0,
            book.threshold || 'N/A'
          ]);
          
          doc.autoTable({
            startY: yPos,
            head: [['Title', 'Author', 'Category', 'Available', 'Threshold']],
            body: lowStockData,
            theme: 'grid',
            headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
            margin: { left: 10, right: 10 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        } catch (tableError) {
          console.error("Error creating low stock table:", tableError);
          yPos += 10;
        }
      }
      
      // Add Popular Books section
      if (data && data.popularBooks && data.popularBooks.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Most Popular Books", 10, yPos);
        yPos += 10;
        
        try {
          const popularBooksData = data.popularBooks.map(book => [
            book.name || 'Unknown',
            book.loans || 0,
            book.rating || 'N/A',
            book.copies || 0
          ]);
          
          doc.autoTable({
            startY: yPos,
            head: [['Title', 'Loans', 'Rating', 'Copies']],
            body: popularBooksData,
            theme: 'grid',
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            margin: { left: 10, right: 10 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        } catch (tableError) {
          console.error("Error creating popular books table:", tableError);
          yPos += 10;
        }
      }
      
      // Add Active Students section
      if (data && data.activeStudents && data.activeStudents.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Most Active Students", 10, yPos);
        yPos += 10;
        
        try {
          const studentsData = data.activeStudents.map((student, index) => [
            index + 1,
            student.name || 'Unknown',
            student.grade || 'N/A',
            student.books || 0
          ]);
          
          doc.autoTable({
            startY: yPos,
            head: [['Rank', 'Student Name', 'Grade', 'Books Borrowed']],
            body: studentsData,
            theme: 'grid',
            headStyles: { fillColor: [56, 142, 60], textColor: [255, 255, 255] },
            margin: { left: 10, right: 10 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        } catch (tableError) {
          console.error("Error creating students table:", tableError);
          yPos += 10;
        }
      }
      
      // Save the PDF
      try {
        const filename = `Library_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
        doc.save(filename);
        console.log("Report saved successfully as", filename);
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);
        throw new Error("Could not save the PDF. " + saveError.message);
      }
      
    } catch (error) {
      console.error("Report generation failed:", error);
      alert("Report generation failed: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      onClick={generateReport}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <Download size={16} className="mr-2" />
          Generate Report
        </>
      )}
    </button>
  );
};

export default SimpleReportGenerator;