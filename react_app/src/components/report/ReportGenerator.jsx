// ReportGenerator.jsx
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Modal, Button } from '../common/ui';
import { Download } from 'lucide-react';

const ReportGenerator = ({ data, dateRange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeBookStats: true,
    includeLowStock: true,
    includePopularBooks: true,
    includeActiveStudents: true,
    includeFeedback: true,
    includeHeaderImage: true,
    title: "Library Management System - Analytics Report"
  });

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setReportOptions({
      ...reportOptions,
      [name]: checked
    });
  };

  const handleTitleChange = (e) => {
    setReportOptions({
      ...reportOptions,
      title: e.target.value
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      try {
        // Create PDF document
        const doc = new jsPDF();
        let yPos = 15;
        const pageWidth = doc.internal.pageSize.width;
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text(reportOptions.title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Add date range
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const dateText = `Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
        doc.text(dateText, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Add generation date
        const generatedText = `Generated on: ${formatDate(new Date().toISOString())}`;
        doc.text(generatedText, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Add executive summary
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Executive Summary', 14, yPos);
        yPos += 7;
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        const summaryText = 
          `This report provides a comprehensive overview of the library's performance for the selected period. ` +
          `During this time, there were 2,467 book loans to 856 active students. 17 books are currently below the recommended stock threshold. ` +
          `The overall user satisfaction rating is 4.7 out of 5, based on collected feedback.`;
        
        const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
        doc.text(splitSummary, 14, yPos);
        yPos += splitSummary.length * 5 + 10;

        // Key Metrics Section
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Key Metrics', 14, yPos);
        yPos += 7;

        // Create a table for key metrics
        const metricsData = [
          ['Total Books Loaned', '2,467'],
          ['Active Students', '856'],
          ['Low Stock Items', '17'],
          ['User Satisfaction', '4.7/5']
        ];

        doc.autoTable({
          startY: yPos,
          head: [['Metric', 'Value']],
          body: metricsData,
          theme: 'grid',
          headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;

        // Low Stock Books Section
        if (reportOptions.includeLowStock && data.lowStockBooks) {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage();
            yPos = 15;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(44, 62, 80);
          doc.text('Books Requiring Acquisition', 14, yPos);
          yPos += 7;
          
          const lowStockData = data.lowStockBooks.map(book => [
            book.title,
            book.author,
            book.category,
            book.copies,
            book.threshold
          ]);

          doc.autoTable({
            startY: yPos,
            head: [['Title', 'Author', 'Category', 'Available Copies', 'Threshold']],
            body: lowStockData,
            theme: 'grid',
            headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // Popular Books Section
        if (reportOptions.includePopularBooks && data.popularBooks) {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage();
            yPos = 15;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(44, 62, 80);
          doc.text('Most Popular Books', 14, yPos);
          yPos += 7;
          
          const popularBooksData = data.popularBooks.map(book => [
            book.name,
            book.loans,
            book.rating,
            book.copies
          ]);

          doc.autoTable({
            startY: yPos,
            head: [['Title', 'Loans', 'Rating', 'Copies Available']],
            body: popularBooksData,
            theme: 'grid',
            headStyles: { fillColor: [67, 97, 238], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // Active Students Section
        if (reportOptions.includeActiveStudents && data.activeStudents) {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage();
            yPos = 15;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(44, 62, 80);
          doc.text('Most Active Students', 14, yPos);
          yPos += 7;
          
          const activeStudentsData = data.activeStudents.map((student, index) => [
            index + 1,
            student.name,
            student.grade,
            student.books
          ]);

          doc.autoTable({
            startY: yPos,
            head: [['Rank', 'Student Name', 'Grade', 'Books Borrowed']],
            body: activeStudentsData,
            theme: 'grid',
            headStyles: { fillColor: [56, 142, 60], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // Feedback Section
        if (reportOptions.includeFeedback && data.feedbackData) {
          // Add a new page for feedback
          doc.addPage();
          yPos = 15;
          
          doc.setFontSize(14);
          doc.setTextColor(44, 62, 80);
          doc.text('Library Service Feedback', 14, yPos);
          yPos += 7;
          
          // Transform feedback data for the table
          const feedbackTableData = data.feedbackData.map(item => {
            const total = item.excellent + item.good + item.average + item.poor;
            const score = ((item.excellent * 5 + item.good * 4 + item.average * 3 + item.poor * 2) / total).toFixed(1);
            return [
              item.category,
              item.excellent,
              item.good,
              item.average,
              item.poor,
              score
            ];
          });

          doc.autoTable({
            startY: yPos,
            head: [['Category', 'Excellent', 'Good', 'Average', 'Poor', 'Avg. Rating']],
            body: feedbackTableData,
            theme: 'grid',
            headStyles: { fillColor: [136, 132, 216], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
          
          // Recent Feedback comments
          if (data.recentFeedback) {
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text('Recent User Feedback', 14, yPos);
            yPos += 7;
            
            const recentFeedbackData = data.recentFeedback.map(feedback => [
              feedback.user,
              feedback.category,
              feedback.rating,
              feedback.comment,
              feedback.time
            ]);

            doc.autoTable({
              startY: yPos,
              head: [['User', 'Category', 'Rating', 'Comment', 'Time']],
              body: recentFeedbackData,
              theme: 'grid',
              headStyles: { fillColor: [136, 132, 216], textColor: [255, 255, 255] },
              styles: { fontSize: 9 },
              columnStyles: {
                3: { cellWidth: 80 }
              },
              margin: { left: 14, right: 14 }
            });
          }
        }

        // Add recommendations section
        doc.addPage();
        yPos = 15;
        
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Recommendations & Next Steps', 14, yPos);
        yPos += 7;
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        const recommendationsText = [
          "1. Acquisition Priority: Place orders for the 5 books with the lowest stock levels, especially 'Introduction to Chemistry' and 'Pride and Prejudice'.",
          
          "2. Inventory Management: Consider increasing the restock threshold for frequently borrowed titles like 'To Kill a Mockingbird'.",
          
          "3. Student Engagement: The data suggests high activity among 12th grade students. Consider targeted reading programs to boost engagement in other grades.",
          
          "4. Service Improvement: While overall satisfaction is high (4.7/5), feedback indicates room for improvement in book selection variety.",
          
          "5. Maintenance: Address feedback about damaged books by conducting a quality inspection of frequently borrowed titles."
        ];
        
        let currentY = yPos;
        recommendationsText.forEach(text => {
          const splitText = doc.splitTextToSize(text, pageWidth - 28);
          doc.text(splitText, 14, currentY);
          currentY += splitText.length * 5 + 5;
        });

        // Save the PDF
        doc.save(`Library_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
        
        setIsGenerating(false);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error generating report:", error);
        setIsGenerating(false);
        alert("There was an error generating the report. Please try again.");
      }
    }, 500); // Small delay to allow UI to update
  };

  return (
    <>
      <button 
        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <Download size={16} className="mr-2" />
        Generate Report
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Generate Library Report</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportOptions.title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Include Sections:</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeBookStats"
                    name="includeBookStats"
                    checked={reportOptions.includeBookStats}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="includeBookStats" className="text-sm text-gray-600">Book Statistics</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeLowStock"
                    name="includeLowStock"
                    checked={reportOptions.includeLowStock}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="includeLowStock" className="text-sm text-gray-600">Low Stock Books</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includePopularBooks"
                    name="includePopularBooks"
                    checked={reportOptions.includePopularBooks}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="includePopularBooks" className="text-sm text-gray-600">Popular Books</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeActiveStudents"
                    name="includeActiveStudents"
                    checked={reportOptions.includeActiveStudents}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="includeActiveStudents" className="text-sm text-gray-600">Active Students</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeFeedback"
                    name="includeFeedback"
                    checked={reportOptions.includeFeedback}
                    onChange={handleOptionChange}
                    className="mr-2"
                  />
                  <label htmlFor="includeFeedback" className="text-sm text-gray-600">User Feedback</label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                onClick={() => setIsModalOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
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
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportGenerator;