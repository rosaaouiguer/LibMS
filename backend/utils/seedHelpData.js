require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const HelpSection = require("../models/helpCenter");

// Sample help content data
const helpData = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: "🚀",
    items: [
      {
        id: "system-overview",
        title: "System Overview",
        content: `<div class="prose prose-blue max-w-none">
          <p class="text-gray-700">The Library Management System is designed to streamline all aspects of library operations.</p>
          <h3 class="font-medium text-lg mt-6 mb-3">Key Features:</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li>Book inventory management</li>
            <li>Student registration and management</li>
            <li>Borrowing and returns processing</li>
            <li>Reservation system</li>
            <li>Reporting and analytics</li>
            <li>User role-based permissions</li>
            <li>Notifications system</li>
          </ul>
        </div>`,
      },
      {
        id: "authentication",
        title: "Authentication",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mt-4 mb-3">Logging In</h3>
          <p>Access the system using your assigned credentials:</p>
          <ul class="space-y-2 list-disc pl-5 mb-4">
            <li>Email address</li>
            <li>Password</li>
          </ul>
          <!-- More authentication content... -->
        </div>`,
      },
      // More items can be added here but truncated for brevity
    ],
  },
  {
    id: "books-management",
    name: "Books Management",
    icon: "📚",
    items: [
      {
        id: "books-overview",
        title: "Books Overview",
        content: `<div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              Understanding the Books Page
            </h3>
            <p class="text-gray-700 mb-4">
              The Books page is where you can view and manage all books in your
              library. Here's what you'll see:
            </p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="font-medium text-blue-800 mb-2">
                Books Page Layout:
              </h4>
              <ul class="space-y-2 list-disc pl-5">
                <li>At the top, you'll find a search bar to look for books</li>
                <li>Next to it is the "Add New Book" button</li>
                <li>Below is a grid showing all your books with pictures</li>
                <li>
                  Each book card shows the title, author, and available copies
                </li>
                <li>
                  At the bottom, you'll find page numbers to see more books
                </li>
              </ul>
            </div>

            <p class="mb-4">
              The number in green on each book card shows how many copies are
              available for lending. If it shows "No Copies" in orange, all
              copies are currently checked out.
            </p>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Tip:</span> You can double-click on
                any book to view its full details or right-click to see more
                options.
              </p>
            </div>

            <h4 class="font-medium text-lg mt-6 mb-2">
              Managing Copies in Bulk
            </h4>
            <p class="mb-4">
              If you need to add or remove multiple copies for several books at
              once:
            </p>
            <ol class="space-y-2 list-decimal pl-5 mb-4">
              <li>
                Click the "Manage Copies" button at the top right of the page
              </li>
              <li>A window will appear where you can select multiple books</li>
              <li>For each book, enter how many copies to add or remove</li>
              <li>Click "Save Changes" when finished</li>
            </ol>
          </div>`,
      },
      {
        id: "searching-books",
        title: "Finding Books",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">How to Find Books</h3>
            <p class="mb-4">
              There are several ways to find books in the system:
            </p>

            <h4 class="font-medium mt-5 mb-2">Using the Search Bar</h4>
            <p class="mb-3">
              The search bar at the top of the Books page can find books by:
            </p>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>Title (example: "Harry Potter")</li>
              <li>Author name (example: "J.K. Rowling")</li>
              <li>ISBN number (example: "9780590353427")</li>
              <li>Call number (example: "FIC ROW")</li>
              <li>Keywords (example: "magic" or "fantasy")</li>
            </ul>

            <div class="bg-gray-100 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">How to Search:</h5>
              <ol class="space-y-1 list-decimal pl-5">
                <li>Click on the search bar</li>
                <li>Type what you're looking for</li>
                <li>Results will appear automatically as you type</li>
              </ol>
            </div>

            <h4 class="font-medium mt-5 mb-2">Using the Book Grid</h4>
            <p class="mb-3">If you prefer to browse books:</p>
            <ul class="space-y-2 list-disc pl-5">
              <li>Scroll down to view more books</li>
              <li>
                Use the page numbers at the bottom to see additional pages of
                books
              </li>
              <li>
                Books are shown as cards with covers and basic information
              </li>
            </ul>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Tip:</span> If you can't find a
                book, try using just part of the title or author's last name.
              </p>
            </div>
          </div>
        `,
      },
      {
        id: "adding-books",
        title: "Adding Books",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">Adding a New Book</h3>
            <p class="mb-4">
              When you need to add a new book to your library:
            </p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="font-medium text-blue-800 mb-2">
                Step-by-Step Instructions:
              </h4>
              <ol class="space-y-2 list-decimal pl-5">
                <li>Click on "Books" in the menu</li>
                <li>Click the "Add New Book" button at the top</li>
                <li>Fill in the book information form</li>
                <li>Click "Add Book" at the bottom right of the form</li>
              </ol>
            </div>

            <h4 class="font-medium mt-6 mb-2">Book Cover Image</h4>
            <p class="mb-3">You can add a picture of the book cover:</p>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>
                Click the "Upload Cover" button on the left side of the form
              </li>
              <li>Choose a picture from your computer</li>
              <li>If you make a mistake, click "Remove Cover" to start over</li>
            </ul>

            <h4 class="font-medium mt-6 mb-2">
              Required Information (marked with *)
            </h4>
            <p class="mb-3">
              You must fill in these details for each book:
            </p>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>
                <span class="font-medium">Title*:</span> The complete title
                of the book
              </li>
              <li>
                <span class="font-medium">Author*:</span> Full name of who
                wrote the book
              </li>
              <li>
                <span class="font-medium">ISBN*:</span> The number found on
                the back cover or copyright page
              </li>
            </ul>

            <h4 class="font-medium mt-5 mb-2">Additional Information</h4>
            <ul class="space-y-2 list-disc pl-5">
              <li>
                <span class="font-medium">Keywords:</span> Words to help
                find the book when searching (separate with commas)
              </li>
              <li>
                <span class="font-medium">E-book Link:</span> Web address
                where an electronic version can be found
              </li>
              <li>
                <span class="font-medium">Summary:</span> Brief description
                of what the book is about
              </li>
              <li>
                <span class="font-medium">Call Number:</span> Library
                location code (if you use them)
              </li>
              <li>
                <span class="font-medium">Total Copies:</span> How many
                copies of this book you have
              </li>
              <li>
                <span class="font-medium">Available Copies:</span> How many
                copies are currently available to lend
              </li>
              <li>
                <span class="font-medium">Barcode:</span> Scanning code if
                your books have them
              </li>
            </ul>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6 mb-6">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Helpful Tip:</span> Have the actual
                book with you when filling out this form - all the information
                you need will be on the cover or first few pages.
              </p>
            </div>

            <p>
              After you click "Add Book," your new book will show up in your
              library collection.
            </p>
          </div>
        `,
      },
      {
        id: "editing-books",
        title: "Editing Book Information",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              How to Change Book Information
            </h3>
            <p class="mb-4">
              If you need to fix or update information about a book:
            </p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="font-medium text-blue-800 mb-2">
                Step-by-Step Instructions:
              </h4>
              <ol class="space-y-2 list-decimal pl-5">
                <li>Find the book in your library list</li>
                <li>Click on the book to open its details</li>
                <li>Click the "Edit" button</li>
                <li>Make your changes in the form that appears</li>
                <li>Click "Save Changes" at the bottom right when finished</li>
              </ol>
            </div>

            <h4 class="font-medium mt-6 mb-2">What You Can Change</h4>
            <p class="mb-3">
              You can update most information about the book:
            </p>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>Book title, author and ISBN</li>
              <li>Book cover image (Upload or Remove)</li>
              <li>Keywords, summary, and e-book link</li>
              <li>Call number and barcode</li>
            </ul>

            <div class="bg-gray-100 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">Items You Cannot Change:</h5>
              <ul class="space-y-1 list-disc pl-5">
                <li>
                  <span class="font-medium">Total Copies:</span> How many
                  books you originally added
                </li>
                <li>
                  <span class="font-medium">Available Copies:</span> How
                  many are currently on shelf
                </li>
                <li>
                  <span class="font-medium text-gray-500">
                    (These numbers change automatically when books are borrowed
                    or returned)
                  </span>
                </li>
              </ul>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Remember:</span> If you need to
                cancel your changes without saving, click the "Back" button at
                the top left or the "Cancel" button at the bottom of the form.
              </p>
            </div>
          </div>
        `,
      },
      {
        id: "managing-copies",
        title: "Managing Book Copies",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              Managing the Number of Books
            </h3>
            <p class="mb-4">
              A library might have several copies of the same book. This guide shows you how
              to add more copies or remove some when needed.
            </p>
            <h4 class="font-medium mt-4 mb-2">For One Book at a Time</h4>
            <ol class="space-y-2 list-decimal pl-5 mb-6">
              <li>Find the book you want on the Books page</li>
              <li>Press the right mouse button on the book picture</li>
              <li>Click on "Manage Copies" when the small menu appears</li>
              <li>
                A window will open where you can:
                <ul class="space-y-1 list-disc pl-5 mt-2">
                  <li>
                    Type a number and click "Add Copies" if you want more books
                  </li>
                  <li>
                    Type a number and click "Remove Copies" if you want fewer books
                  </li>
                </ul>
              </li>
              <li>Click "Save" when you're done to keep your changes</li>
            </ol>
            <h4 class="font-medium mt-6 mb-2">
              For Several Books at the Same Time
            </h4>
            <ol class="space-y-2 list-decimal pl-5 mb-4">
              <li>
                Click the "Manage Copies" button in the top right corner of the Books
                page
              </li>
              <li>A window will open showing a list of books</li>
              <li>Check the boxes next to the books you want to change</li>
              <li>Click the "Manage Copies" button at the bottom</li>
              <li>
                For each book in your list, you can:
                <ul class="space-y-1 list-disc pl-5 mt-2">
                  <li>Use the + and - buttons in the "Add Copies" section to get more books</li>
                  <li>Use the + and - buttons in the "Remove Copies" section to reduce books</li>
                </ul>
              </li>
              <li>When you've made all your changes, click "Apply Changes"</li>
            </ol>
            <div class="bg-red-50 border-l-4 border-red-400 p-4 mt-4 mb-6">
              <p class="text-sm text-red-800">
                <span class="font-bold">Important Note:</span> You can't 
                remove books that are currently checked out by someone. For example, if 
                your library has 5 copies of a book but 3 are checked out to patrons, 
                you can only remove up to 2 copies at that time.
              </p>
            </div>
            <h4 class="font-medium mt-4 mb-2">
              Understanding the Numbers You See
            </h4>
            <p class="mb-3">
              For each book, you'll see two important numbers:
            </p>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>
                <span class="font-medium">Total Copies:</span> How many of this book your library owns altogether
              </li>
              <li>
                <span class="font-medium">Available Copies:</span> How many are currently on the shelf and ready for checkout (not borrowed by anyone)
              </li>
            </ul>
            <p class="mb-3">
              You'll always see these numbers displayed as "Available / Total" (for example, "3 / 5" means 3 books available out of 5 total copies).
            </p>
          </div>
        `,
      },
      {
        id: "lending-books",
        title: "Lending Books",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              How to Lend Books to Students
            </h3>
            <p class="mb-4">When a student wants to borrow a book from the library:</p>
            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="font-medium text-blue-800 mb-2">
                Simple Lending Steps:
              </h4>
              <ol class="space-y-2 list-decimal pl-5">
                <li>Find the book on the Books page by looking through the list or using the search box</li>
                <li>Click the right mouse button on the picture of the book you want to lend</li>
                <li>Choose "Lend Book" from the menu that appears</li>
                <li>
                  On the lending form that opens:
                  <ul class="space-y-1 list-disc pl-5 mt-2">
                    <li>Pick the student's name from the dropdown list (students are listed alphabetically)</li>
                    <li>Make sure the book information shown is the right book</li>
                    <li>The return date is already filled in for you (usually set for 2 weeks from today)</li>
                    <li>Choose the condition of the book (Perfect, Good, Fair, or Poor)</li>
                  </ul>
                </li>
                <li>Click the blue "Lend Book" button at the bottom to finish</li>
              </ol>
            </div>
            <p class="mb-4">What happens after you lend a book:</p>
            <ul class="space-y-2 list-disc pl-5 mb-6">
              <li>
                The number of available books will decrease by one
              </li>
              <li>The book will be added to the student's borrowing record</li>
              <li>You'll see a green message telling you the book was successfully lent</li>
              <li>The form will clear so you can lend another book if needed</li>
            </ul>
            <h4 class="font-medium mt-5 mb-2">When You Can't Lend a Book</h4>
            <p class="mb-3">Sometimes you won't be able to lend a book because:</p>
            <ul class="space-y-2 list-disc pl-5">
              <li>
                All copies of the book are already loaned out to other students
              </li>
              <li>The student has already borrowed the maximum number of books allowed</li>
              <li>
                The student has books that are overdue and need to be returned first
              </li>
              <li>The student is currently banned from borrowing (you'll see "BANNED" next to their name)</li>
            </ul>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Helpful Tip:</span> If the student needs a book that is currently checked out, you can show them how to place a reservation so they'll be notified when it becomes available.
              </p>
            </div>
          </div>
        `,
      },
      {
        id: "book-reservations",
        title: "Book Reservations",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              Managing Book Reservations
            </h3>

            <p class="mb-4">
              When a book isn't available, students can reserve it for when a
              copy is returned:
            </p>

            <h4 class="font-medium mt-4 mb-2">
              How to Create a Reservation
            </h4>
            <ol class="space-y-2 list-decimal pl-5 mb-6">
              <li>Find the book on the Books page</li>
              <li>Right-click on the book card</li>
              <li>Select "Reserve Book" from the menu</li>
              <li>Select the student who wants to reserve the book</li>
              <li>Click "Confirm Reservation"</li>
            </ol>

            <div class="bg-gray-100 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">When Can a Book Be Reserved?</h5>
              <p class="mb-2">You can only reserve books that:</p>
              <ul class="space-y-1 list-disc pl-5">
                <li>
                  Have all copies currently checked out (0 available copies)
                </li>
              </ul>
            </div>

            <h4 class="font-medium mt-5 mb-2">
              What Happens After a Reservation
            </h4>
            <ul class="space-y-2 list-disc pl-5 mb-4">
              <li>The student is added to a waiting list for the book</li>
              <li>When a copy becomes available, the system will notify you</li>
              <li>
                The book will be held for the student for a set period (usually
                48 hours)
              </li>
              <li>
                If the student doesn't pick up the book in that time, the
                reservation expires
              </li>
            </ul>

            <h4 class="font-medium mt-5 mb-2">
              Viewing and Managing Reservations
            </h4>
            <p class="mb-3">To see all current reservations:</p>
            <ol class="space-y-2 list-decimal pl-5 mb-6">
              <li>Go to the "Reservations" section from the main menu</li>
              <li>You'll see a list of all current reservations</li>
              <li>
                From here you can:
                <ul class="space-y-1 list-disc pl-5 mt-2">
                  <li>
                    Mark a reservation as fulfilled when the student picks up
                    the book
                  </li>
                  <li>
                    Cancel a reservation if the student no longer wants the book
                  </li>
                  <li>Extend the hold period if needed</li>
                </ul>
              </li>
            </ol>
          </div>
        `,
      },
      {
        id: "lending-rights",
        title: "Lending Rights",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              Understanding Book Lending Rights
            </h3>

            <p class="mb-4">
              Lending rights control how long students can borrow books from
              your library. This simple guide will help you understand the
              settings.
            </p>

            <h4 class="font-medium mt-4 mb-2">
              How to Find Lending Rights
            </h4>
            <ol class="space-y-2 list-decimal pl-5 mb-6">
              <li>Look for the book you want to change</li>
              <li>Right-click on the book</li>
              <li>Choose "Edit Lending Rights"</li>
              <li>A window will open up</li>
            </ol>

            <h4 class="font-medium mt-5 mb-2">
              Understanding the Settings Window
            </h4>
            <p class="mb-3">The window lets you set:</p>
            <ul class="space-y-2 list-disc pl-5 mb-6">
              <li>
                <span class="font-medium">Loan Duration:</span> How many
                days students can keep the book (enter a number of days)
              </li>
              <li>
                <span class="font-medium">Allow Loan Extensions:</span> Turn
                on or off using the blue toggle switch
              </li>
              <li>
                <span class="font-medium">
                  Days For Reservation Pickup:
                </span>{" "}
                How many extensions students can request
              </li>
              <li>
                <span class="font-medium">Extension Duration:</span> How
                many extra days each extension gives
              </li>
            </ul>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">The Summary Box</h5>
              <p>
                At the bottom of the window, you'll see a blue summary box that
                shows:
              </p>
              <ul class="space-y-1 list-disc pl-5">
                <li>How long students can borrow the book</li>
                <li>Whether they can extend their loan</li>
                <li>How extensions work (if allowed)</li>
              </ul>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Remember:</span> When you save
                changes, they only affect new loans. Books already checked out
                keep their old rules until returned.
              </p>
            </div>

            <div class="bg-gray-100 p-4 rounded-lg">
              <h5 class="font-medium mb-2">Buttons at the Bottom:</h5>
              <ul class="space-y-1 list-disc pl-5">
                <li>
                  <span class="font-medium">Remove Override:</span> (Red
                  button) Removes special rules for this book
                </li>
                <li>
                  <span class="font-medium">Cancel:</span> Closes the window
                  without saving
                </li>
                <li>
                  <span class="font-medium">Save Changes:</span> (Purple
                  button) Saves your new settings
                </li>
              </ul>
            </div>
          </div>
        `,
      },
      {
        id: "deleting-books",
        title: "Removing Books",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">
              How to Remove Books from Inventory
            </h3>

            <p class="mb-4">
              When a book is damaged, lost, or no longer needed in your
              collection:
            </p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="font-medium text-blue-800 mb-2">
                Deleting a Book:
              </h4>
              <ol class="space-y-2 list-decimal pl-5">
                <li>Find the book on the Books page</li>
                <li>Right-click on the book card</li>
                <li>Select "Delete" from the menu</li>
                <li>A confirmation window will appear asking if you're sure</li>
                <li>Click "Delete" to confirm or "Cancel" to go back</li>
              </ol>
            </div>

            <div class="bg-red-50 border-l-4 border-red-400 p-4 mt-4 mb-6">
              <p class="text-sm text-red-800">
                <span class="font-bold">Warning:</span> You cannot delete a
                book if any copies are currently checked out. All copies must be
                returned first.
              </p>
            </div>

            <h4 class="font-medium mt-5 mb-2">
              Alternative: Reducing Copies Instead
            </h4>
            <p class="mb-3">
              If only some copies of a book are damaged or lost, you can reduce
              the number of copies instead of deleting the entire book record:
            </p>
            <ol class="space-y-2 list-decimal pl-5">
              <li>Find the book on the Books page</li>
              <li>Right-click on the book card</li>
              <li>Select "Manage Copies" from the menu</li>
              <li>Enter the number of copies to remove</li>
              <li>Click "Remove Copies" and then "Save"</li>
            </ol>

            <h4 class="font-medium mt-6 mb-2">
              What Happens When a Book is Deleted
            </h4>
            <ul class="space-y-2 list-disc pl-5">
              <li>The book is completely removed from your inventory</li>
              <li>
                All historical lending records for the book are preserved for
                reporting
              </li>
              <li>
                Any active reservations for the book are automatically canceled
              </li>
            </ul>
          </div>
        `,
      },
      {
        id: "book-details",
        title: "Book Detail View",
        content: `
          <div class="prose prose-blue max-w-none">
            <h3 class="font-medium text-lg mb-3">The Book Details Page</h3>

            <p class="mb-4">
              This page shows you all information about your library book in one
              place.
            </p>

            <h4 class="font-medium mt-4 mb-2">How to Find Book Details</h4>
            <ul class="space-y-2 list-disc pl-5 mb-6">
              <li>Find the book you want to view</li>
              <li>Click on the book</li>
              <li>The Book Details page will open</li>
            </ul>

            <h4 class="font-medium mt-5 mb-2">
              What You'll See on This Page
            </h4>
            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">At the Top:</h5>
              <ul class="space-y-1 list-disc pl-5">
                <li>A "Back to Books" button to return to your book list</li>
                <li>The title "Book Details" in the center</li>
              </ul>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">Main Book Information:</h5>
              <ul class="space-y-1 list-disc pl-5">
                <li>
                  Book cover image (or "No cover image" if none available)
                </li>
                <li>Title of the book in large letters</li>
                <li>Author name in blue text</li>
                <li>
                  Colored tag showing how many copies are available (green when
                  most copies are available, orange when few copies are
                  available, red when no copies are available)
                </li>
                <li>Keywords associated with the book</li>
                <li>Two buttons: "Edit Book" (blue) and "Delete Book" (red)</li>
              </ul>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">Book Details Cards:</h5>
              <p class="mb-2">
                The gray section shows these details in separate boxes:
              </p>
              <ul class="space-y-1 list-disc pl-5">
                <li>ISBN number (if available)</li>
                <li>Barcode (if available)</li>
                <li>Available and total copies</li>
                <li>Call number (if available)</li>
                <li>E-book link (if available) - click to open the e-book</li>
              </ul>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 class="font-medium mb-2">Book Summary:</h5>
              <p>
                If the book has a summary, you'll see it at the bottom of the
                page in a gray box.
              </p>
            </div>

            <h4 class="font-medium mt-5 mb-2">Using the Buttons</h4>
            <ul class="space-y-2 list-disc pl-5">
              <li>
                <span class="font-medium">
                  "Back to Books" button (top left):
                </span>{" "}
                Returns you to your book list
              </li>
              <li>
                <span class="font-medium">"Edit Book" button (blue):</span>{" "}
                Change information about this book
              </li>
              <li>
                <span class="font-medium">"Delete Book" button (red):</span>{" "}
                Remove this book from your library
              </li>
            </ul>

            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <p class="text-sm text-yellow-800">
                <span class="font-bold">Important:</span> If you click
                "Delete Book," you'll see a warning message asking you to
                confirm. Be careful - once deleted, the book can't be recovered!
              </p>
            </div>
          </div>
        `,
      },
    ],
  },
  {
    id: "student-management",
    name: "Student Management",
    icon: "👥",
    items: [
      {
        id: "student-overview",
        title: "Students Overview",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Understanding the Students Page</h3>
          <p class="text-gray-700 mb-4">The Students page allows you to manage all student records in the library system. Here you can view, add, edit, and manage student information.</p>
          
          <h4 class="font-medium mt-4 mb-2">Main Features of the Students Page:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>View a list of all registered students</li>
            <li>Search for students by ID, name, or email</li>
            <li>Filter students by categories and status</li>
            <li>Add new students to the system</li>
            <li>View detailed information about each student</li>
            <li>Edit student information</li>
            <li>Send notifications to students</li>
            <li>Ban or unban students when necessary</li>
          </ul>
          
          <h4 class="font-medium mt-4 mb-2">Getting to the Students Page:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Log in to the Library Management System</li>
            <li>From the main menu on the left side, click on "Students"</li>
            <li>The Students page will open, showing all registered students</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">If you can't see the Students option in the menu, you may not have the necessary permissions. Please contact your system administrator.</p>
          </div>
        </div>`,
      },
      {
        id: "searching-students",
        title: "Finding Students",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Search for Students</h3>
          <p class="text-gray-700 mb-4">You can easily search for specific students using the search bar at the top of the Students page.</p>
          
          <h4 class="font-medium mt-4 mb-2">Using the Search Bar:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Look for the search box at the top of the Students page (it has a magnifying glass icon)</li>
            <li>Click on the search box and type what you're looking for</li>
            <li>You can search by:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>Student ID number</li>
                <li>Student name</li>
                <li>Student email address</li>
              </ul>
            </li>
            <li>Results will appear automatically as you type</li>
            <li>The more specific your search term, the more targeted your results will be</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Using Filters:</h4>
          <p class="text-gray-700 mb-4">You can also use filters to narrow down the list of students:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Look for options showing "Active Filters" on the Students page</li>
            <li>You can filter by:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>Category (student type)</li>
                <li>Status (active or banned)</li>
              </ul>
            </li>
            <li>Click on a filter option to apply it</li>
            <li>To remove a filter, click the small "x" next to the filter name</li>
            <li>To remove all filters at once, click "Clear All"</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">If you can't find a student even after searching, they might not be registered in the system yet. You may need to add them as a new student.</p>
          </div>
        </div>`,
      },
      {
        id: "student-registration",
        title: "Adding New Students",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Register a New Student</h3>
          <p class="text-gray-700 mb-4">Adding new students to the system allows them to borrow books and use library services.</p>
          
          <h4 class="font-medium mt-4 mb-2">Step-by-Step Registration Process:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Go to the Students page</li>
            <li>Look for the blue "Add New Student" button at the top right of the page</li>
            <li>Click this button to open the registration form</li>
            <li>Fill in all required student information:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>Full name</li>
                <li>Student ID (must be unique)</li>
                <li>Email address (must be unique)</li>
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Category (student type)</li>
                <li>Profile picture (optional)</li>
              </ul>
            </li>
            <li>Double-check all information for accuracy</li>
            <li>Click the "Save" button at the bottom of the form</li>
            <li>If all information is correct, the new student will appear in the student list</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Common Registration Errors:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><span class="font-medium">Duplicate Student ID</span>: If you see an error saying "This Student ID is already assigned to another student," you need to use a different ID number.</li>
            <li><span class="font-medium">Duplicate Email</span>: If you see an error saying "This email address is already registered to another student," you need to use a different email address.</li>
            <li><span class="font-medium">Missing Required Information</span>: Make sure all required fields (marked with *) are filled in.</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">It's a good practice to verify student identity before adding them to the system. Ask to see their student ID card or other identification.</p>
          </div>
        </div>`,
      },
      {
        id: "student-categories",
        title: "Student Categories",
        content: `<div class="prose prose-blue max-w-none">
        <h3 class="font-medium text-lg mb-3">Understanding Student Categories</h3>
        <p class="mb-4">Student categories help us manage different types of library users with different borrowing privileges. For example, graduate students might be allowed to borrow more books than first-year students.</p>
        
        <h4 class="font-medium mt-6 mb-2">Viewing Student Categories</h4>
        <ol class="space-y-2 list-decimal pl-5 mb-4">
          <li>Click on "Student Management" in the side menu</li>
          <li>Select "Student Categories"</li>
          <li>You will see cards showing all available student categories</li>
        </ol>
        
        <h4 class="font-medium mt-6 mb-2">What You Can See For Each Category</h4>
        <ul class="space-y-2 list-disc pl-5 mb-4">
          <li><strong>Category Name:</strong> The name of the student group (like "Graduate" or "First Year")</li>
          <li><strong>Borrowing Limit:</strong> How many books students in this category can borrow at once</li>
          <li><strong>Loan Duration:</strong> How many days students can keep borrowed books</li>
          <li><strong>Default Ban:</strong> How many days a student is banned if they don't return books on time</li>
        </ul>
        
        <h4 class="font-medium mt-6 mb-2">Adding a New Student Category</h4>
        <ol class="space-y-2 list-decimal pl-5 mb-4">
          <li>Click the "Add Category" button at the top right</li>
          <li>Fill in the form with the following information:
            <ul class="space-y-1 list-disc pl-5 mt-2">
              <li>Category Name (e.g., "Second Year")</li>
              <li>Borrowing Limit (how many books they can borrow)</li>
              <li>Loan Duration (how many days they can keep books)</li>
              <li>Default Ban Duration (penalty days for late returns)</li>
              <li>Toggle "Allow Loan Extensions" if students can request more time</li>
            </ul>
          </li>
          <li>If you allow extensions, set how many extensions they can have and for how long</li>
          <li>Review the summary at the bottom of the form</li>
          <li>Click "Add Category" to save</li>
        </ol>
        
        <h4 class="font-medium mt-6 mb-2">Editing a Student Category</h4>
        <ol class="space-y-2 list-decimal pl-5 mb-4">
          <li>Find the category card you want to change</li>
          <li>Click the "Edit" button on that card</li>
          <li>Update any information you need to change</li>
          <li>Click "Save Changes" when finished</li>
        </ol>
        
        <h4 class="font-medium mt-6 mb-2">Deleting a Student Category</h4>
        <ol class="space-y-2 list-decimal pl-5 mb-4">
          <li>Find the category you want to remove</li>
          <li>Click the "Delete" button on that card</li>
          <li>A confirmation box will appear - read it carefully</li>
          <li>Click "Delete Category" to confirm</li>
        </ol>
        <p class="text-red-600 mt-2"><strong>Important:</strong> When you delete a category, students in that category will be moved to the default category automatically.</p>
        
        <h4 class="font-medium mt-6 mb-2">Searching for Categories</h4>
        <p class="mb-2">If you have many categories and need to find a specific one:</p>
        <ol class="space-y-2 list-decimal pl-5 mb-4">
          <li>Use the search box at the top of the page</li>
          <li>Type the name of the category you're looking for</li>
          <li>The list will automatically show only matching categories</li>
        </ol>
        </div>`,
      },
      {
        id: "student-details",
        title: "Viewing Student Details",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to View Student Information</h3>
          <p class="text-gray-700 mb-4">You can view detailed information about each student in the system. This includes their contact information, status, and category.</p>
          
          <h4 class="font-medium mt-4 mb-2">To View a Student's Details:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Go to the Students page</li>
            <li>Find the student you want to view (use search if needed)</li>
            <li>Click on the student's card/name from the list</li>
            <li>The system will show a detailed view with all of the student's information</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">What You Can See in the Student Details:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><span class="font-medium">Profile Picture</span>: The student's photo (if provided)</li>
            <li><span class="font-medium">Student ID</span>: The unique identification number for this student</li>
            <li><span class="font-medium">Full Name</span>: The student's complete name</li>
            <li><span class="font-medium">Category</span>: The type of student (e.g., Undergraduate, Graduate, Faculty)</li>
            <li><span class="font-medium">Ban Status</span>: Whether the student is currently banned from using the library</li>
            <li><span class="font-medium">Email Address</span>: The student's contact email</li>
            <li><span class="font-medium">Phone Number</span>: The student's contact phone number</li>
            <li><span class="font-medium">Date of Birth</span>: The student's birth date</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Actions You Can Take From the Details Page:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><span class="font-medium">Edit</span>: Update the student's information</li>
            <li><span class="font-medium">Notify</span>: Send a notification to the student</li>
            <li><span class="font-medium">Ban/Unban</span>: Restrict or restore the student's library privileges</li>
            <li><span class="font-medium">Back to Students</span>: Return to the main students list page</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">If a student has requested to update their information, always verify their identity before making any changes to their record.</p>
          </div>
        </div>`,
      },
      {
        id: "editing-students",
        title: "Editing Student Information",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Edit Student Information</h3>
          <p class="text-gray-700 mb-4">Sometimes you need to update a student's information, such as when they change their email address or phone number.</p>
          
          <h4 class="font-medium mt-4 mb-2">To Edit a Student's Information:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the student you want to edit using search or browsing the student list</li>
            <li>You can edit from two places:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>From the student list: Click the pencil icon (✏️) on the student's card</li>
                <li>From the student details page: Click the "Edit" button at the top of the page</li>
              </ul>
            </li>
            <li>A form will open showing the current student information</li>
            <li>Update any information that needs to be changed</li>
            <li>Click the "Save" button to apply your changes</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Fields You Can Edit:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Date of birth</li>
            <li>Category (student type)</li>
            <li>Profile picture</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Common Editing Errors:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><span class="font-medium">Duplicate Email</span>: If you try to change the email to one that's already in use by another student, you'll see an error message.</li>
            <li><span class="font-medium">Invalid Format</span>: Make sure email addresses, phone numbers, and dates are entered in the correct format.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Important Note About Student IDs:</h4>
          <p class="text-gray-700 mb-4">In most cases, you cannot change a student's ID number once it has been assigned. If a student ID must be changed, please contact your system administrator for assistance.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Always verify the student's identity before making changes to their record. This helps prevent unauthorized changes to student information.</p>
          </div>
        </div>`,
      },
      {
        id: "student-banning",
        title: "Managing Student Access",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Ban and Unban Students</h3>
          <p class="text-gray-700 mb-4">Sometimes you may need to temporarily restrict a student's library privileges. The system allows you to ban students for a specific period when necessary.</p>
          
          <h4 class="font-medium mt-4 mb-2">When to Ban a Student:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Repeated late returns of books</li>
            <li>Damaging library materials</li>
            <li>Violating library policies</li>
            <li>Administrative reasons (unpaid fines, expired ID, etc.)</li>
          </ul>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Banning a Student</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the student you want to ban</li>
            <li>You can ban from two places:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>From the student list: Click on the three dots (⋮) on the student's card and select "Ban"</li>
                <li>From the student details page: Click the "Ban" button at the top of the page</li>
              </ul>
            </li>
            <li>A dialog box will appear asking for ban details</li>
            <li>Select how long to ban the student for:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>1 day</li>
                <li>1 week</li>
                <li>1 month</li>
                <li>Custom period (select specific date)</li>
              </ul>
            </li>
            <li>Add a reason for the ban (this is important for record-keeping)</li>
            <li>Click "Confirm Ban" to apply the restriction</li>
          </ol>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Unbanning a Student</h3>
          <p class="text-gray-700 mb-4">When a student's ban period is over or if you need to remove a ban early:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the banned student (you can use filters to show only banned students)</li>
            <li>You can unban from two places:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>From the student list: Click on the three dots (⋮) on the student's card and select "Unban"</li>
                <li>From the student details page: Click the "Unban" button at the top of the page</li>
              </ul>
            </li>
            <li>Confirm that you want to remove the ban</li>
            <li>The student's status will change back to active immediately</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Automatic Unbanning:</h4>
          <p class="text-gray-700 mb-4">Students will automatically be unbanned when their ban period expires. You don't need to manually unban them unless you want to end their ban early.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Always include a clear reason when banning a student. This helps if there are questions later about why the action was taken.</p>
          </div>
        </div>`,
      },
      {
        id: "notifications",
        title: "Sending Student Notifications",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Send Notifications to Students</h3>
          <p class="text-gray-700 mb-4">The system allows you to send important notifications directly to students. This feature helps you communicate about overdue books, reservation status, or library announcements.</p>
          
          <h4 class="font-medium mt-4 mb-2">Types of Notifications You Might Send:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Overdue book reminders</li>
            <li>Reserved book availability</li>
            <li>Fine payment reminders</li>
            <li>Library hour changes</li>
            <li>Library event announcements</li>
            <li>Account status updates</li>
          </ul>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Sending a Notification to a Student</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the student you want to notify</li>
            <li>You can send a notification from two places:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>From the student list: Click on the three dots (⋮) on the student's card and select "Notify"</li>
                <li>From the student details page: Click the "Notify" button at the top of the page</li>
              </ul>
            </li>
            <li>A notification dialog will open</li>
            <li>Select the notification type from the dropdown menu</li>
            <li>Fill in the subject line (make it clear and specific)</li>
            <li>Type your message in the message box</li>
            <li>Review your notification for any errors</li>
            <li>Click "Send Notification" to deliver your message</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">After Sending a Notification:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>The system will show a confirmation message when the notification is sent successfully</li>
            <li>The notification will be delivered to the student through their registered email address</li>
            <li>A record of the notification will be stored in the system for tracking purposes</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Notification Templates:</h4>
          <p class="text-gray-700 mb-4">For common notifications, the system provides templates that you can use. These save time and ensure consistent messaging:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>When sending a notification, look for the "Use Template" option</li>
            <li>Select the appropriate template from the dropdown list</li>
            <li>The subject and message will be automatically filled with the template text</li>
            <li>You can edit this text as needed before sending</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Keep notifications clear and concise. Include any necessary action items at the beginning of your message so they aren't missed.</p>
          </div>
        </div>`,
      },
      {
        id: "pagination",
        title: "Navigating Multiple Pages",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Navigate Through Multiple Pages of Students</h3>
          <p class="text-gray-700 mb-4">When you have many students in the system, they will be shown on multiple pages. The pagination feature helps you navigate through these pages easily.</p>
          
          <h4 class="font-medium mt-4 mb-2">Understanding the Pagination Controls:</h4>
          <p class="text-gray-700 mb-4">At the bottom of the Students page, you'll find the pagination controls that look something like this:</p>
          
          <div class="border border-gray-200 p-4 rounded-lg mb-6 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-700">Showing <span class="font-medium">1</span> to <span class="font-medium">8</span> of <span class="font-medium">24</span> results</p>
            </div>
            <div>
              <nav class="flex items-center space-x-1">
                <button disabled class="px-2 py-1 bg-gray-100 text-gray-400">← Previous</button>
                <button class="px-2 py-1 bg-blue-50 text-blue-600">1</button>
                <button class="px-2 py-1 bg-white text-gray-500">2</button>
                <button class="px-2 py-1 bg-white text-gray-500">3</button>
                <button class="px-2 py-1 bg-white text-gray-500">Next →</button>
              </nav>
            </div>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">How to Use Pagination:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>The current page number is highlighted in blue</li>
            <li>To go to a specific page, click on that page number</li>
            <li>To go to the next page, click the "Next" button</li>
            <li>To go to the previous page, click the "Previous" button</li>
            <li>The first line shows you which students you're currently viewing (for example, "Showing 1 to 8 of 24 results")</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Important Things to Know About Pagination:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Each page typically shows 8 students at a time</li>
            <li>When you search or apply filters, the system will reset to page 1</li>
            <li>If there are many pages, you'll see ellipsis (...) to indicate skipped pages</li>
            <li>The "Previous" button is disabled when you're on page 1</li>
            <li>The "Next" button is disabled when you're on the last page</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">If you're looking for a specific student, it's usually faster to use the search feature at the top of the page rather than browsing through multiple pages.</p>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "borrowings-management",
    name: "Borrowings Management",
    icon: "📖",
    items: [
      {
        id: "borrowings-overview",
        title: "Understanding Borrowings",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">What is Borrowing Management?</h3>
          <p class="text-gray-700 mb-4">Borrowing Management is where you keep track of all the books that students have borrowed from the library. Think of it as a record book that shows who has which book and when they need to return it.</p>
          
          <h4 class="font-medium mt-6 mb-2">The Borrowing Page Shows:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-4">
            <li>Student names - who borrowed the book</li>
            <li>Book titles - which books are borrowed</li>
            <li>Borrowing dates - when the book was taken</li>
            <li>Due dates - when the book should be returned</li>
            <li>Status - whether the book is currently out (Active), late (Overdue), or has been brought back (Returned)</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
            <h4 class="font-medium text-blue-800 mb-2">Tip:</h4>
            <p class="text-blue-700">The color of the status tag tells you important information at a glance:</p>
            <ul class="space-y-1 list-disc pl-5">
              <li><span class="text-yellow-600 font-medium">Yellow</span> means the book is currently borrowed (Active)</li>
              <li><span class="text-red-600 font-medium">Red</span> means the book is overdue and needs to be returned</li>
              <li><span class="text-green-600 font-medium">Green</span> means the book has been returned</li>
            </ul>
          </div>
        </div>`,
      },
      {
        id: "finding-borrowings",
        title: "Finding Borrowing Records",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Find a Specific Borrowing Record</h3>
          <p class="text-gray-700 mb-4">You can easily find any borrowing record using the search box at the top of the page.</p>
          
          <h4 class="font-medium mt-4 mb-2">Using the Search Box:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Look for the search box at the top of the page (it has a small magnifying glass icon)</li>
            <li>Click inside the box and type what you're looking for. You can search by:</li>
            <ul class="space-y-1 list-disc pl-5 mb-4 mt-2">
              <li>Student name (e.g., "John Smith")</li>
              <li>Book title (e.g., "To Kill a Mockingbird")</li>
              <li>Date (e.g., "2025-05-01")</li>
              <li>Status (type "Active", "Overdue", or "Returned")</li>
            </ul>
            <li>The list will automatically update to show only matching records</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Sorting the Borrowing List:</h4>
          <p class="text-gray-700 mb-3">You can sort the list to find what you need faster:</p>
          <ol class="space-y-2 list-decimal pl-5">
            <li>Click on any column header (like "Student Name" or "Due Date")</li>
            <li>The list will sort by that column</li>
            <li>Click the same column header again to reverse the order (from A-Z to Z-A)</li>
          </ol>
          
          <div class="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
            <h4 class="font-medium text-amber-800 mb-2">Remember:</h4>
            <p class="text-amber-700">If you have many borrowing records, only a few will show on each page. Use the numbers at the bottom of the page to see more records.</p>
          </div>
        </div>`,
      },
      {
        id: "new-borrowing",
        title: "Creating New Borrowings",
        content: `<div class="prose prose-blue max-w-none">
<h3 class="font-medium text-lg mb-3">Recording When a Student Borrows a Book</h3>
<p class="text-gray-700 mb-4">When a student wants to borrow a book, you need to create a new borrowing record in the system. Here's how:</p>
      <h4 class="font-medium mt-4 mb-2">Adding a New Borrowing:</h4>
      <ol class="space-y-2 list-decimal pl-5 mb-6">
        <li>Find the blue "New Borrowing" button at the top right of the page and click it</li>
        <li>A form will appear asking for information:</li>
        <ul class="space-y-1 list-disc pl-5 mb-4 mt-2">
          <li>Select the student's name from the dropdown list</li>
          <li>Select the book title from the dropdown list (books without available copies will be grayed out)</li>
          <li>The borrow date will automatically show today's date</li>
          <li>The due date will be calculated based on lending rights or student category</li>
          <li>Select the book's condition (Perfect, Good, Fair, or Poor)</li>
        </ul>
        <li>Click the "Save" button when everything is filled out</li>
        <li>The new borrowing will appear in your list</li>
      </ol>
      
      <div class="bg-green-50 p-4 rounded-md border border-green-200 mt-4">
        <h4 class="font-medium text-green-800 mb-2">Tip:</h4>
        <p class="text-green-700">The system will show you how many books a student can still borrow. If a student is banned or has reached their borrowing limit, the system will not allow you to proceed.</p>
      </div>
    </div>`,
      },
      {
        id: "view-details",
        title: "Viewing Borrowing Details",
        content: `<div class="prose prose-blue max-w-none">
      <h3 class="font-medium text-lg mb-3">How to See All Information About a Borrowing</h3>
      <p class="text-gray-700 mb-4">You can view complete details about any borrowing by clicking on it:</p>
      
      <h4 class="font-medium mt-4 mb-2">What You'll See in the Details:</h4>
      <ul class="space-y-2 list-disc pl-5">
        <li>Current status (Active, Overdue, or Returned)</li>
        <li>Days remaining or days overdue</li>
        <li>Book information (title and ISBN)</li>
        <li>Student information (name and category)</li>
        <li>Borrowing dates (when borrowed and when due)</li>
        <li>Book condition at time of lending</li>
        <li>Return details (if the book has been returned)</li>
      </ul>
      
      <h4 class="font-medium mt-4 mb-2">Actions You Can Take:</h4>
      <p class="text-gray-700 mb-3">From the details view, you can:</p>
      <ul class="space-y-2 list-disc pl-5 mb-6">
        <li><strong>Renew</strong> the borrowing (extend the due date) if allowed for this student</li>
        <li><strong>Return Book</strong> to record when a book is returned</li>
        <li><strong>Close</strong> the details view to go back to the list</li>
      </ul>
      
      <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
        <h4 class="font-medium text-blue-800 mb-2">Helpful to Know:</h4>
        <p class="text-blue-700">The system will show a warning if a book is overdue, displaying exactly how many days it is late.</p>
      </div>
    </div>`,
      },
      {
        id: "returning-books",
        title: "Processing Book Returns",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Recording When Books Are Returned</h3>
          <p class="text-gray-700 mb-4">When a student brings back a book, you need to record it in the system. Here's how to process a book return:</p>
          
          <h4 class="font-medium mt-4 mb-2">Marking a Book as Returned:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the borrowing record in the list (use the search box if needed)</li>
            <li>Click the <strong>"Return" button</strong> on the right side of the record</li>
            <li>A form will open asking about the book's condition:</li>
            <ul class="space-y-1 list-disc pl-5 mb-4 mt-2">
              <li>Select the condition (Perfect, Good, Fair, Poor)</li>
            </ul>
            <li>Click the "Confirm Return" button</li>
            <li>The status will change to "Returned" (green) in your list</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Alternative Ways to Return a Book:</h4>
          <ul class="space-y-2 list-disc pl-5">
            <li><strong>From the details view:</strong> Click "Return Book" button after viewing details</li>
            <li><strong>Right-click menu:</strong> Right-click on the borrowing and select "Return Book"</li>
          </ul>
          
          <div class="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
            <h4 class="font-medium text-amber-800 mb-2">Important:</h4>
            <p class="text-amber-700">Always check the book's condition carefully before processing a return. The return date will automatically be set to today's date.</p>
          </div>
        </div>`,
      },
      {
        id: "renewals",
        title: "Renewing Borrowed Books",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Extending a Book's Due Date</h3>
          <p class="text-gray-700 mb-4">Sometimes students need more time with a book. You can extend the borrowing period (renew) if allowed by library rules.</p>
          
          <h4 class="font-medium mt-4 mb-2">How to Renew a Borrowing:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the borrowing record you want to renew</li>
            <li>Click the <strong>"Renew" button</strong> (Note: if the button is gray, renewals aren't allowed for this book)</li>
            <li>A form will open showing:</li>
            <ul class="space-y-1 list-disc pl-5 mb-4 mt-2">
              <li>Current due date</li>
              <li>New suggested due date</li>
              <li>Information about the extension policy being applied</li>
              <li>You can adjust the new date if needed</li>
            </ul>
            <li>Click "Confirm Renewal" to extend the borrowing period</li>
            <li>The due date will be updated on the borrowing record</li>
            <li>If the book was overdue, its status will change back to "Borrowed"</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">How Extension Periods Are Calculated:</h4>
          <p class="text-gray-700 mb-3">The system automatically determines the appropriate extension period based on:</p>
          <ul class="space-y-2 list-disc pl-5">
            <li>Book lending policy (specific to each book)</li>
            <li>Student category policy (if no book-specific policy exists)</li>
            <li>Default extension period (usually 7 days) if no other rules apply</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
            <h4 class="font-medium text-blue-800 mb-2">Helpful Tip:</h4>
            <p class="text-blue-700">The renewal form will show you which policy is being applied for the extension period. You can always select a different date if needed.</p>
          </div>
        </div>`,
      },
      {
        id: "reminders",
        title: "Sending Reminders",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Reminding Students About Due Dates</h3>
          <p class="text-gray-700 mb-4">You can send notifications to students about their borrowed books. This is helpful for reminding them of upcoming due dates or overdue books.</p>
          
          <h4 class="font-medium mt-4 mb-2">How to Send a Reminder:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the borrowing you want to send a reminder for</li>
            <li>Click the "Send Reminder" button or option</li>
            <li>A confirmation window will appear asking if you're sure</li>
            <li>Verify the student name and book title shown in the message</li>
            <li>Click "Send Reminder" to notify the student</li>
            <li>You'll see a confirmation when the reminder is sent</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">What the Student Receives:</h4>
          <p class="text-gray-700 mb-3">The student will get a notification reminding them about:</p>
          <ul class="space-y-2 list-disc pl-5">
            <li>The title of the book they borrowed</li>
            <li>When it's due to be returned</li>
            <li>Contact information for the library if they have questions</li>
          </ul>
          
          <div class="bg-green-50 p-4 rounded-md border border-green-200 mt-4">
            <h4 class="font-medium text-green-800 mb-2">Best Practice:</h4>
            <p class="text-green-700">Send reminders a few days before books are due to help students avoid overdue items. Also send reminders for overdue books to encourage prompt returns.</p>
          </div>
        </div>`,
      },
      {
        id: "deleting-borrowings",
        title: "Deleting Borrowing Records",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Removing Incorrect Borrowing Records</h3>
          <p class="text-gray-700 mb-4">Sometimes you might need to delete a borrowing record, such as when it was created by mistake. Be careful with this action as it permanently removes the record.</p>
          
          <h4 class="font-medium mt-4 mb-2">How to Delete a Borrowing Record:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the borrowing record you want to delete</li>
            <li>Click the "Delete" option or button</li>
            <li>A confirmation window will appear with the message "Confirm Deletion"</li>
            <li>The window will show the book title and student name</li>
            <li>Carefully review these details to make sure it's the correct record</li>
            <li>Click "Delete" to permanently remove the record or "Cancel" to go back</li>
          </ol>
          
          <div class="bg-red-50 p-4 rounded-md border border-red-200 mt-4">
            <h4 class="font-medium text-red-800 mb-2">Warning:</h4>
            <p class="text-red-700">Deleting a borrowing record cannot be undone. Only delete records that were created in error. For normal returned books, use the "Return Book" function instead of deleting.</p>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">When to Delete a Borrowing:</h4>
          <ul class="space-y-2 list-disc pl-5">
            <li>When you selected the wrong student or book by mistake</li>
            <li>When a borrowing was recorded but the student didn't actually take the book</li>
            <li>When duplicate borrowing records were created for the same transaction</li>
          </ul>
        </div>`,
      },
      {
        id: "using-context-menu",
        title: "Using the Right-Click Menu",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Understanding the Right-Click Menu</h3>
          <p class="text-gray-700 mb-4">The right-click menu (also called the context menu) provides quick access to actions for any borrowing record. This is often the fastest way to perform common tasks.</p>
          
          <h4 class="font-medium mt-4 mb-2">How to Use the Right-Click Menu:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the borrowing record you want to work with</li>
            <li>Position your mouse pointer over that record</li>
            <li>Press the right button on your mouse</li>
            <li>A menu will appear with available actions</li>
            <li>Click on the action you want to perform</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Available Menu Options:</h4>
          <p class="text-gray-700 mb-3">Depending on the borrowing status, the menu will show different options:</p>
          <ul class="space-y-2 list-disc pl-5">
            <li><strong>View Details</strong> - See all information about the borrowing</li>
            <li><strong>Renew Borrowing</strong> - Extend the due date (if allowed)</li>
            <li><strong>Return Book</strong> - Process a book return</li>
            <li><strong>Send Reminder</strong> - Notify the student about due/overdue book</li>
            <li><strong>Delete Borrowing</strong> - Remove the record (use with caution)</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
            <h4 class="font-medium text-blue-800 mb-2">Helpful to Know:</h4>
            <p class="text-blue-700">Some menu options might be grayed out if they're not available for that particular borrowing. For example, you won't see "Return Book" on records that are already returned.</p>
          </div>
        </div>`,
      },
      {
        id: "understanding-status",
        title: "Understanding Borrowing Status",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Book Status Explained</h3>
          <p class="text-gray-700 mb-4">Each borrowing record has a status that shows you at a glance what's happening with that book. Understanding these statuses helps you manage the library efficiently.</p>
          
          <h4 class="font-medium mt-4 mb-2">The Three Borrowing Statuses:</h4>
          
          <div class="mb-6">
            <div class="flex items-center mb-2">
              <span class="inline-block w-20 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-600 mr-3">Active</span>
              <span class="text-gray-700">The book is currently borrowed and not yet due</span>
            </div>
            <p class="text-gray-600 pl-24 text-sm">This means a student has the book and should return it by the due date shown.</p>
          </div>
          
          <div class="mb-6">
            <div class="flex items-center mb-2">
              <span class="inline-block w-20 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600 mr-3">Overdue</span>
              <span class="text-gray-700">The due date has passed but the book hasn't been returned</span>
            </div>
            <p class="text-gray-600 pl-24 text-sm">This means the student should be reminded to return the book as soon as possible.</p>
          </div>
          
          <div class="mb-6">
            <div class="flex items-center mb-2">
              <span class="inline-block w-20 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600 mr-3">Returned</span>
              <span class="text-gray-700">The book has been brought back to the library</span>
            </div>
            <p class="text-gray-600 pl-24 text-sm">This means the borrowing transaction is complete.</p>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">Status Changes:</h4>
          <ul class="space-y-2 list-disc pl-5">
            <li>The system automatically changes from <span class="text-yellow-600 font-medium">Active</span> to <span class="text-red-600 font-medium">Overdue</span> when the due date passes</li>
            <li>You manually change the status to <span class="text-green-600 font-medium">Returned</span> when processing a book return</li>
            <li>When you renew a book, an <span class="text-red-600 font-medium">Overdue</span> book can go back to <span class="text-yellow-600 font-medium">Active</span> with a new due date</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
            <h4 class="font-medium text-blue-800 mb-2">Tip for Efficiency:</h4>
            <p class="text-blue-700">You can click the "Status" column header to sort the list by status. This makes it easy to see all overdue books grouped together.</p>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "reservation-management",
    name: "Reservation Management",
    icon: "📝",
    items: [
      {
        id: "reservation-overview",
        title: "Understanding Reservations",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">What is a Reservation?</h3>
          <p class="text-gray-700 mb-4">A reservation is a request made by a student to borrow a book that is currently unavailable. This creates a waiting list for popular books.</p>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Types of Reservation Status:</h3>
          <ul class="space-y-3 list-disc pl-5 mb-6">
            <li>
              <span class="font-medium">Awaiting Pickup</span> - The book is ready for the student to collect. A time countdown shows how long before the reservation expires.
            </li>
            <li>
              <span class="font-medium">Still Held</span> - The book is currently borrowed by another student. The reservation is in a queue.
            </li>
            <li>
              <span class="font-medium">Canceled</span> - The reservation has been canceled and is no longer active.
            </li>
          </ul>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Important Things to Know:</h3>
          <ul class="space-y-3 list-disc pl-5">
            <li>Students have a limited time to pick up a book once it becomes available (typically 1-3 days).</li>
            <li>If a student doesn't pick up the book within this time, the reservation expires and the book becomes available to the next student in the queue.</li>
            <li>You can extend reservation pickup deadlines if needed.</li>
            <li>Canceled reservations can be completely removed from the system.</li>
          </ul>
        </div>`,
      },
      {
        id: "viewing-reservations",
        title: "Viewing Reservations",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Accessing the Reservation Page</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Click on the "Reservation Management" item in the main menu</li>
            <li>The system will display a table with all current reservations</li>
          </ol>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Understanding the Reservation Table:</h3>
          <ul class="space-y-3 list-disc pl-5 mb-6">
            <li>
              <span class="font-medium">Student Name</span> - The name of the student who made the reservation
            </li>
            <li>
              <span class="font-medium">Book Title</span> - The title of the book being reserved
            </li>
            <li>
              <span class="font-medium">Current Borrower</span> - Who currently has the book (if applicable)
            </li>
            <li>
              <span class="font-medium">Status</span> - The current state of the reservation (Awaiting Pickup, Still Held, or Canceled)
            </li>
          </ul>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Finding Specific Reservations:</h3>
          <p class="text-gray-700 mb-4">You can search for specific reservations using the search box at the top of the page. Type any of the following:</p>
          <ul class="space-y-2 list-disc pl-5">
            <li>Student name (e.g., "John Smith")</li>
            <li>Book title (e.g., "The Great Gatsby")</li>
            <li>Status (e.g., "Awaiting Pickup")</li>
            <li>Current borrower name (e.g., "Mary Jones")</li>
          </ul>
          
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  If you cannot find a reservation, try using just part of a name or title. For example, search for "Smith" instead of "John Smith".
                </p>
              </div>
            </div>
          </div>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Sorting Reservations:</h3>
          <p class="text-gray-700 mb-4">Click on the "Status" column header to sort reservations. Clicking once sorts from A to Z, clicking again sorts from Z to A.</p>
        </div>`,
      },
      {
        id: "adding-reservations",
        title: "Creating a New Reservation",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Adding a New Reservation</h3>
          <ol class="space-y-3 list-decimal pl-5 mb-6">
            <li>
              Go to the Reservation Management page
            </li>
            <li>
              Click the blue "New Reservation" button at the top-right corner
            </li>
            <li>
              In the popup form:
              <ul class="space-y-2 list-disc pl-5 mt-2 mb-2">
                <li>Select the student who wants to reserve the book</li>
                <li>Select the book they wish to reserve (only books with 0 available copies can be reserved)</li>
                <li>Set the number of days the student will have to pick up the book once it becomes available</li>
              </ul>
            </li>
            <li>
              Click "Save" to complete the process
            </li>
          </ol>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  Only books with 0 available copies can be reserved. The pickup days are determined by the book's custom rules or the student's category settings.
                </p>
              </div>
            </div>
          </div>
          
          <h3 class="font-medium text-lg mt-6 mb-3">What Happens After Creating a Reservation?</h3>
          <ul class="space-y-3 list-disc pl-5">
            <li>If the book is available, the student will have a limited time to pick it up (shown as a countdown)</li>
            <li>If the book is not available, the student will be added to a waiting list</li>
            <li>The system will show the reservation in the main table with its current status</li>
          </ul>
        </div>`,
      },
      {
        id: "managing-reservations",
        title: "Managing Existing Reservations",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Actions You Can Take with Reservations</h3>
          <p class="text-gray-700 mb-4">There are several actions you can perform on each reservation depending on its status:</p>
          
          <h4 class="font-medium mt-6 mb-2">For "Awaiting Pickup" Reservations:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>
              <span class="font-medium">Mark as Picked Up</span> - When a student collects their reserved book:
              <ul class="space-y-2 list-disc pl-5 mt-2 mb-2">
                <li>Click the "Mark as Picked Up" button next to the reservation</li>
                <li>In the popup form, select the condition of the book (Perfect, Good, Fair, or Poor)</li>
                <li>Click "Confirm Pickup" to complete the process</li>
                <li>This will remove the book from the reservations list and add it to the borrowings list</li>
              </ul>
            </li>
            <li>
              <span class="font-medium">Extend Reservation</span> - If a student needs more time to pick up their book:
              <ul class="space-y-2 list-disc pl-5 mt-2 mb-2">
                <li>Click the "Extend" button next to the reservation</li>
                <li>Enter the number of additional days to extend the pickup deadline</li>
                <li>Click "Extend" to update the deadline</li>
              </ul>
            </li>
            <li>
              <span class="font-medium">Cancel Reservation</span> - If the reservation is no longer needed:
              <ul class="space-y-2 list-disc pl-5 mt-2 mb-2">
                <li>Click the "Cancel" button next to the reservation</li>
                <li>Confirm your action in the popup dialog</li>
                <li>The reservation status will change to "Canceled"</li>
              </ul>
            </li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">For "Still Held" Reservations:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-4">
            <li>
              <span class="font-medium">Cancel Reservation</span> - Similar to above, you can cancel a reservation that is still waiting for the book to become available
            </li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">For "Canceled" Reservations:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>
              <span class="font-medium">Delete Reservation</span> - To completely remove the canceled reservation from the system:
              <ul class="space-y-2 list-disc pl-5 mt-2 mb-2">
                <li>Click the "Delete" button next to the reservation</li>
                <li>Confirm your action in the popup dialog</li>
                <li>The reservation will be permanently removed from the system</li>
              </ul>
            </li>
          </ul>
          
          <div class="bg-red-50 border-l-4 border-red-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  <span class="font-medium">Warning:</span> Deleting a reservation cannot be undone. Make sure you really want to remove the record permanently before confirming this action.
                </p>
              </div>
            </div>
          </div>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Using the Right-Click Menu</h3>
          <p class="text-gray-700 mb-4">You can also right-click on any reservation to see available actions in a popup menu:</p>
          <ol class="space-y-2 list-decimal pl-5">
            <li>Move your mouse pointer over the reservation row you want to manage</li>
            <li>Click the right mouse button</li>
            <li>A menu will appear showing all possible actions for that reservation</li>
            <li>Click on the action you want to perform</li>
          </ol>
        </div>`,
      },
      {
        id: "reservation-tips",
        title: "Helpful Tips and Best Practices",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Tips for Managing Reservations Effectively</h3>
          
          <div class="bg-green-50 border-l-4 border-green-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">
                  <span class="font-medium">Pro Tip:</span> Check the reservation page at the beginning of each day to see if any books need to be prepared for pickup.
                </p>
              </div>
            </div>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">Daily Practices:</h4>
          <ul class="space-y-3 list-disc pl-5 mb-6">
            <li>
              <span class="font-medium">Check for books ready for pickup</span> - Look for reservations with "Awaiting Pickup" status, and make sure the books are placed in the pickup area.
            </li>
            <li>
              <span class="font-medium">Monitor expiring reservations</span> - Pay attention to "Awaiting Pickup" reservations with short time left (less than 1 day). Consider contacting these students as a courtesy reminder.
            </li>
            <li>
              <span class="font-medium">Clean up old canceled reservations</span> - Periodically delete canceled reservations to keep your system tidy.
            </li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Handling Common Situations:</h4>
          <ol class="space-y-3 list-decimal pl-5 mb-6">
            <li>
              <span class="font-medium">Student requests more time for pickup</span>
              <p class="mt-1 mb-2">Use the "Extend" button to give them additional days to pick up their book.</p>
            </li>
            <li>
              <span class="font-medium">Book is damaged when returned</span>
              <p class="mt-1 mb-2">When marking a book as picked up, use the condition notes to document the current state of the book.</p>
            </li>
            <li>
              <span class="font-medium">Student no longer wants a reserved book</span>
              <p class="mt-1 mb-2">Use the "Cancel Reservation" option to free up the book for other students.</p>
            </li>
            <li>
              <span class="font-medium">Student doesn't pick up in time</span>
              <p class="mt-1 mb-2">If the pickup deadline passes, you should cancel the reservation so the book becomes available to the next student in line.</p>
            </li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Communication with Students:</h4>
          <ul class="space-y-3 list-disc pl-5">
            <li>
              When a book becomes available for pickup, consider notifying the student through your normal communication channels.
            </li>
            <li>
              If you extend a reservation deadline, let the student know about their new pickup date.
            </li>
            <li>
              When canceling a reservation that has been waiting for a long time, it's good practice to inform the student of the cancellation.
            </li>
          </ul>
        </div>`,
      },
      {
        id: "troubleshooting",
        title: "Troubleshooting Common Issues",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Common Problems and Solutions</h3>
          
          <div class="space-y-6">
            <div>
              <h4 class="font-medium text-md mb-2">Problem: Can't find a specific reservation</h4>
              <p class="mb-2">Solutions:</p>
              <ul class="space-y-2 list-disc pl-5">
                <li>Try searching with just part of the student's name or book title</li>
                <li>Check if you have multiple pages of reservations and use the page navigation at the bottom</li>
                <li>Make sure the reservation hasn't been canceled and deleted already</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-medium text-md mb-2">Problem: Wrong status showing for a reservation</h4>
              <p class="mb-2">Solutions:</p>
              <ul class="space-y-2 list-disc pl-5">
                <li>Refresh the page by clicking the browser's reload button</li>
                <li>If a book was returned but the reservation still shows "Still Held", contact technical support</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-medium text-md mb-2">Problem: Can't create a new reservation</h4>
              <p class="mb-2">Solutions:</p>
              <ul class="space-y-2 list-disc pl-5">
                <li>Check if all required fields are filled in correctly</li>
                <li>Make sure the student doesn't already have a reservation for the same book</li>
                <li>Verify that the book exists in the system and is spelled correctly</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-medium text-md mb-2">Problem: Reservation shows wrong time remaining</h4>
              <p class="mb-2">Solutions:</p>
              <ul class="space-y-2 list-disc pl-5">
                <li>Refresh the page to update the countdown timer</li>
                <li>Check if your computer's date and time settings are correct</li>
                <li>If the problem persists, contact technical support</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-medium text-md mb-2">Problem: "Mark as Picked Up" button doesn't work</h4>
              <p class="mb-2">Solutions:</p>
              <ul class="space-y-2 list-disc pl-5">
                <li>Make sure you're clicking on the button itself, not just the row</li>
                <li>Try using the right-click menu instead</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  If you continue to experience technical problems, please contact your system administrator or IT support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "data-import",
    name: "Data Import",
    icon: "📥",
    items: [
      {
        id: "import-overview",
        title: "Understanding Data Import",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">What is Data Import?</h3>
          <p class="text-gray-700 mb-4">Data Import is a helpful feature that allows you to add many students or books at once instead of adding them one by one. This is especially useful when you have a lot of new records to add to the system.</p>
          
          <h4 class="font-medium mt-4 mb-2">What You Can Import:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Students</strong> - Add many student records at once</li>
            <li><strong>Books</strong> - Add many book records at once</li>
          </ul>
          
          <h4 class="font-medium mt-4 mb-2">How to Access the Import Page:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Log in to the Library Management System</li>
            <li>From the main menu on the left side, look for "Import Data" or a similar option</li>
            <li>Click on it to open the Data Import page</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Important Note:</p>
            <p class="text-blue-700">Before importing data, it's good to prepare your information in an organized way. The system can read files in CSV format (like Excel spreadsheets saved as CSV) or Excel files (.xlsx, .xls).</p>
          </div>
        </div>`,
      },
      {
        id: "preparing-import-files",
        title: "Preparing Your Files for Import",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Prepare Your Files</h3>
          <p class="text-gray-700 mb-4">Before importing data, you need to prepare your information in a file format that the system can understand.</p>
          
          <h4 class="font-medium mt-4 mb-2">Accepted File Formats:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>CSV files</strong> - These are simple text files that can be created with Microsoft Excel or Google Sheets</li>
            <li><strong>Excel files</strong> - Files with .xlsx or .xls extensions from Microsoft Excel</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">For Student Records, Include These Fields:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>name</strong> - Student's full name</li>
            <li><strong>studentId</strong> - The unique ID number for the student</li>
            <li><strong>dateOfBirth</strong> - Student's date of birth (use format DD/MM/YYYY if possible)</li>
            <li><strong>email</strong> - Student's email address (if you don't include this, the system will try to create one automatically)</li>
            <li><strong>category</strong> - The student's category or class</li>
            <li><strong>phone</strong> - Student's phone number</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">For Book Records, Include These Fields:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>title</strong> - The title of the book</li>
            <li><strong>author</strong> - The book's author</li>
            <li><strong>isbn</strong> - The ISBN number of the book</li>
            <li><strong>callNumber</strong> - Where to find the book in the library</li>
            <li><strong>totalCopies</strong> - How many copies of this book you have in total</li>
            <li><strong>availableCopies</strong> - How many copies are currently available</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Tips for Creating Your Import File:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Open Excel or your preferred spreadsheet program</li>
            <li>Create a header row at the top with column names that match the fields listed above</li>
            <li>Enter your data in the rows below, with one record per row</li>
            <li>Save the file as .csv or .xlsx format</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Even if you don't name your columns exactly as listed above, the system will help you match your columns to the right fields during import.</p>
          </div>
        </div>`,
      },
      {
        id: "importing-students",
        title: "Importing Student Records",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Import Student Records</h3>
          <p class="text-gray-700 mb-4">Follow these simple steps to import student records into the system:</p>
          
          <h4 class="font-medium mt-4 mb-2">Step-by-Step Instructions:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Go to the Data Import page</li>
            <li>Select "Students" as the import type (this is usually selected by default)</li>
            <li>Prepare your student data file (CSV or Excel) as explained in the "Preparing Your Files" section</li>
            <li>Click on the "browse" link in the upload area, or simply drag and drop your file onto the upload area</li>
            <li>Wait while the system reads your file</li>
            <li>The system will show you a preview of the data found in your file</li>
            <li>The system will try to automatically match your columns to the correct fields, but you should check these mappings carefully</li>
            <li>Use the dropdown menus under each column to select which field it should be mapped to</li>
            <li>If there are columns you don't want to import, select "-- Ignore Column --" from the dropdown</li>
            <li>Make sure essential fields like name, studentId, and dateOfBirth are correctly mapped</li>
            <li>Click the "Import Data" button to begin the import process</li>
            <li>Wait while the system processes your data - you'll see a progress bar</li>
            <li>When complete, the system will show you how many records were successfully imported and if there were any errors</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">About Student Categories:</h4>
          <p class="text-gray-700 mb-4">The system will try to match the category names in your file with the categories already in the system. If it can't find an exact match, it will select the default category.</p>
          
          <h4 class="font-medium mt-6 mb-2">About Email Addresses:</h4>
          <p class="text-gray-700 mb-4">If you don't provide email addresses for students, the system will try to create them automatically using the student's name (in the format: firstname.lastname@ensia.edu.dz).</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg mb-6">
            <p class="text-yellow-800 font-medium">Common Problems:</p>
            <p class="text-yellow-700">If you see errors during import, check for:</p>
            <ul class="space-y-1 list-disc pl-5 mt-2 text-yellow-700">
              <li>Missing required information (like student ID or name)</li>
              <li>Incorrect date formats</li>
              <li>Students that already exist in the system</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">After importing students, you might want to use the "Student Promotion" feature to move them to a new category if needed.</p>
          </div>
        </div>`,
      },
      {
        id: "importing-books",
        title: "Importing Book Records",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Import Book Records</h3>
          <p class="text-gray-700 mb-4">Follow these simple steps to import book records into the system:</p>
          
          <h4 class="font-medium mt-4 mb-2">Step-by-Step Instructions:</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Go to the Data Import page</li>
            <li>Click on the "Books" option to select it as your import type</li>
            <li>Prepare your book data file (CSV or Excel) as explained in the "Preparing Your Files" section</li>
            <li>Click on the "browse" link in the upload area, or simply drag and drop your file onto the upload area</li>
            <li>Wait while the system reads your file</li>
            <li>The system will show you a preview of the data found in your file</li>
            <li>Check the column mappings carefully - use the dropdown menus under each column to select which field it should be mapped to</li>
            <li>If there are columns you don't want to import, select "-- Ignore Column --" from the dropdown</li>
            <li>Make sure the essential fields like title, author, and ISBN are correctly mapped</li>
            <li>Click the "Import Data" button to begin the import process</li>
            <li>Wait while the system processes your data - you'll see a progress bar</li>
            <li>When complete, the system will show you how many books were successfully imported and if there were any errors</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">About Book Quantities:</h4>
          <p class="text-gray-700 mb-4">If you don't specify how many copies of each book you have:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>The system will set "totalCopies" to 1 by default</li>
            <li>The system will set "availableCopies" to 0 by default</li>
          </ul>
          <p class="text-gray-700 mb-4">You can update these numbers later if needed.</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg mb-6">
            <p class="text-yellow-800 font-medium">Common Problems:</p>
            <p class="text-yellow-700">If you see errors during import, check for:</p>
            <ul class="space-y-1 list-disc pl-5 mt-2 text-yellow-700">
              <li>Missing titles, authors, or ISBN numbers</li>
              <li>Books that already exist in the system with the same ISBN</li>
              <li>Using text where numbers are expected (like for totalCopies)</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Take your time to check that your data is correct before importing, especially the ISBN numbers which are used to identify unique books.</p>
          </div>
        </div>`,
      },
      {
        id: "troubleshooting-imports",
        title: "Fixing Import Problems",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Common Import Problems and Solutions</h3>
          <p class="text-gray-700 mb-4">If you're having trouble with the import process, here are some common issues and how to fix them:</p>
          
          <h4 class="font-medium mt-4 mb-2">File Doesn't Upload:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> Nothing happens when you try to upload your file</li>
            <li><strong>Solution:</strong> Make sure your file is in CSV or Excel (.xlsx, .xls) format. Try a smaller file if your file is very large.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">No Data Shows in Preview:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> The file uploads but no data appears in the preview</li>
            <li><strong>Solution:</strong> Check that your file has data in the correct format. Make sure it has headers in the first row and data in the rows below.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Import Button Is Gray (Disabled):</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> The "Import Data" button is gray and you can't click it</li>
            <li><strong>Solution:</strong> You need to map all the required fields. For students, make sure name, studentId, and dateOfBirth are mapped. For books, make sure title, author, and ISBN are mapped.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Many Errors During Import:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> The import starts but shows many errors</li>
            <li><strong>Solution:</strong> Check the error messages for clues. Common issues include missing required information, duplicate records, or information in the wrong format. Fix your data file and try again.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Student Categories Not Matching:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> Students are being imported with the wrong categories</li>
            <li><strong>Solution:</strong> Make sure the category names in your file match exactly the categories in the system. If you're unsure, log in and check the exact names in the Student Categories section.</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Dates Not Importing Correctly:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Problem:</strong> Student birth dates are showing up wrong</li>
            <li><strong>Solution:</strong> Make sure dates are in the format DD/MM/YYYY (day/month/year). If using Excel, make sure the cells are formatted as dates.</li>
          </ul>
          
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 font-medium">When All Else Fails:</p>
            <p class="text-blue-700">If you continue to have problems with the import process, try these steps:</p>
            <ol class="space-y-1 list-decimal pl-5 mt-2 text-blue-700">
              <li>Click the "Start Over" button to reset the import process</li>
              <li>Check your file for any special characters or formatting that might cause problems</li>
              <li>Try importing a smaller number of records at first to see if that works</li>
              <li>Ask a colleague who has used the import feature before for help</li>
              <li>Contact your system administrator for assistance</li>
            </ol>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "exporting-data",
    name: "Exporting Data",
    icon: "📊",
    items: [
      {
        id: "export-overview",
        title: "Export Overview",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">What is the Export Feature?</h3>
          <p class="text-gray-700 mb-4">The Export feature allows you to create copies of your library data (students and books) that you can save to your computer. This is useful for:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Creating backup records of your library information</li>
            <li>Printing student or book lists</li>
            <li>Sharing library information with colleagues</li>
            <li>Creating reports for meetings or record-keeping</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">Where to Find the Export Feature</h4>
          <p class="text-gray-700 mb-4">You can find the Export feature in the main menu. Look for the button or tab labeled "Export Data".</p>
        </div>`,
      },
      {
        id: "selecting-data-to-export",
        title: "Selecting What to Export",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Choosing Between Students and Books</h3>
          <p class="text-gray-700 mb-4">At the top of the Export page, you'll see two tabs:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Students</strong> - Click this tab to export information about library members</li>
            <li><strong>Books</strong> - Click this tab to export information about your book collection</li>
          </ul>
          
          <h4 class="font-medium mt-6 mb-2">How to Select Specific Items</h4>
          <p class="text-gray-700 mb-4">To choose which items to export:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Click on the item's row in the table (it will turn blue when selected)</li>
            <li>You can select multiple items by clicking on each one</li>
            <li>To select all items at once, click the small box in the top left corner of the table</li>
            <li>To unselect an item, simply click on it again</li>
          </ol>
          
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <strong>Important:</strong> You must select at least one item before you can export data.
                </p>
              </div>
            </div>
          </div>
        </div>`,
      },
      {
        id: "filtering-data",
        title: "Filtering Your Data",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Finding Specific Information</h3>
          <p class="text-gray-700 mb-4">If you have many students or books, you can use filters to find specific ones:</p>
          
          <h4 class="font-medium mt-4 mb-2">Using the Search Box</h4>
          <p class="text-gray-700 mb-4">At the top of the page, you'll see a search box labeled "Search students..." or "Search books...". Type any information you're looking for:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>For students: Try typing a name, email, or ID number</li>
            <li>For books: Try typing a title, author, or call number</li>
          </ul>
          <p class="text-gray-700 mb-4">The list will automatically update to show only matching items.</p>
          
          <h4 class="font-medium mt-6 mb-2">Using the Filter Button</h4>
          <p class="text-gray-700 mb-4">For more specific filtering:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Click the "Filter" button next to the search box</li>
            <li>A small menu will appear showing different categories</li>
            <li>Check the boxes for categories you want to see</li>
            <li>Click "Apply" to update the list</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Removing Filters</h4>
          <p class="text-gray-700 mb-4">To clear your filters:</p>
          <ul class="space-y-1 list-disc pl-5 mb-6">
            <li>Click "Reset Filters" in the filter menu, or</li>
            <li>Click the X next to any blue filter tag that appears above the table</li>
          </ul>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Tip:</strong> Filtering your data first makes it easier to select just the items you want to export.
                </p>
              </div>
            </div>
          </div>
        </div>`,
      },
      {
        id: "choosing-export-format",
        title: "Choosing Export Format",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Available Export Formats</h3>
          <p class="text-gray-700 mb-4">You can export your data in different formats depending on how you plan to use it:</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-2">Excel (XLSX)</h4>
              <p class="text-sm text-gray-600">Best for:</p>
              <ul class="text-sm list-disc pl-5 text-gray-600">
                <li>Working with data in Microsoft Excel</li>
                <li>Creating charts and graphs</li>
                <li>Sorting and filtering information</li>
              </ul>
            </div>
            
            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-2">CSV</h4>
              <p class="text-sm text-gray-600">Best for:</p>
              <ul class="text-sm list-disc pl-5 text-gray-600">
                <li>Importing into many different programs</li>
                <li>Simple data that needs to be widely compatible</li>
                <li>Working with older software</li>
              </ul>
            </div>
            
            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-2">PDF</h4>
              <p class="text-sm text-gray-600">Best for:</p>
              <ul class="text-sm list-disc pl-5 text-gray-600">
                <li>Printing physical copies</li>
                <li>Sharing with others who don't need to edit the data</li>
                <li>Official documentation or reports</li>
              </ul>
            </div>
            
            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-2">JSON</h4>
              <p class="text-sm text-gray-600">Best for:</p>
              <ul class="text-sm list-disc pl-5 text-gray-600">
                <li>Technical or IT staff who need the data</li>
                <li>Using the data with web applications</li>
                <li>More advanced data processing</li>
              </ul>
            </div>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">How to Select a Format</h4>
          <p class="text-gray-700 mb-4">You'll see format options below the search area:</p>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Click on the format you want (it will turn blue when selected)</li>
            <li>You can select multiple formats to create several files at once</li>
            <li>At least one format must be selected to export</li>
          </ol>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Recommendation:</strong> If you're not sure which format to choose, Excel (XLSX) is a good option for most purposes. It's widely used and easy to work with.
                </p>
              </div>
            </div>
          </div>
        </div>`,
      },
      {
        id: "completing-export",
        title: "Completing the Export",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Exporting Your Selected Data</h3>
          <p class="text-gray-700 mb-4">After you've selected your data items and chosen your export format(s), you're ready to export:</p>
          
          <h4 class="font-medium mt-4 mb-2">Step-by-Step Export Process</h4>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Verify that you see blue checkmarks next to all the items you want to export</li>
            <li>Check that at least one export format is selected (highlighted in blue)</li>
            <li>Click the blue "Export" button in the top right corner</li>
            <li>Wait a moment while the system processes your request</li>
            <li>Each file will be downloaded to your computer</li>
          </ol>
          
          <h4 class="font-medium mt-6 mb-2">Finding Your Exported Files</h4>
          <p class="text-gray-700 mb-4">The files will typically be saved to your Downloads folder, but this depends on your browser settings. Each file will have a name that includes:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>What kind of data it contains (students or books)</li>
            <li>Today's date</li>
            <li>The file format (like .xlsx, .csv, .pdf, or .json)</li>
          </ul>
          <p class="text-gray-700">For example: <code>library_students_export_2025-05-12.xlsx</code></p>
          
          <div class="bg-red-50 border-l-4 border-red-400 p-4 mt-6 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  <strong>Important:</strong> If nothing happens when you click Export, make sure you've selected at least one item (student or book) and at least one format.
                </p>
              </div>
            </div>
          </div>
          
          <h4 class="font-medium mt-6 mb-2">Privacy and Security</h4>
          <p class="text-gray-700 mb-4">Remember that exported files may contain personal information. Please follow these guidelines:</p>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li>Store exported files securely</li>
            <li>Only share them with authorized staff members</li>
            <li>Delete the files when you no longer need them</li>
            <li>Never email these files unless absolutely necessary</li>
          </ul>
        </div>`,
      },
      {
        id: "troubleshooting-exports",
        title: "Troubleshooting Exports",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Common Export Problems and Solutions</h3>
          
          <div class="space-y-6 mt-4">
            <div class="border rounded-lg p-5">
              <h4 class="font-medium mb-2">Problem: The Export Button Is Gray (Disabled)</h4>
              <p class="mb-2 text-gray-700">This happens when:</p>
              <ul class="list-disc pl-5 mb-4 text-gray-700">
                <li>You haven't selected any students or books to export</li>
              </ul>
              <p class="font-medium text-gray-700">Solution:</p>
              <p class="text-gray-700">Click on at least one student or book in the list (it should turn blue when selected).</p>
            </div>
            
            <div class="border rounded-lg p-5">
              <h4 class="font-medium mb-2">Problem: No File Downloaded</h4>
              <p class="mb-2 text-gray-700">This might happen because:</p>
              <ul class="list-disc pl-5 mb-4 text-gray-700">
                <li>Your browser might be blocking pop-ups or downloads</li>
                <li>The system encountered an error during export</li>
              </ul>
              <p class="font-medium text-gray-700">Solutions:</p>
              <ol class="list-decimal pl-5 text-gray-700">
                <li>Check your browser for notifications about blocked downloads</li>
                <li>Try a different export format</li>
                <li>Try selecting fewer items to export at once</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
            
            <div class="border rounded-lg p-5">
              <h4 class="font-medium mb-2">Problem: Can't Find Exported Files</h4>
              <p class="mb-2 text-gray-700">Your downloads might be going to a different folder than expected.</p>
              <p class="font-medium text-gray-700">Solutions:</p>
              <ol class="list-decimal pl-5 text-gray-700">
                <li>Check your browser's download history (usually Ctrl+J or Command+J)</li>
                <li>Look in your computer's Downloads folder</li>
                <li>Search your computer for "library_export" or the current date</li>
              </ol>
            </div>
            
            <div class="border rounded-lg p-5">
              <h4 class="font-medium mb-2">Problem: Excel/PDF Files Don't Open</h4>
              <p class="mb-2 text-gray-700">This might happen if:</p>
              <ul class="list-disc pl-5 mb-4 text-gray-700">
                <li>You don't have the right program installed to open the file</li>
                <li>The file downloaded incorrectly</li>
              </ul>
              <p class="font-medium text-gray-700">Solutions:</p>
              <ul class="list-disc pl-5 text-gray-700">
                <li>For Excel files: Make sure you have Microsoft Excel, Google Sheets, or another spreadsheet program</li>
                <li>For PDF files: Make sure you have Adobe Reader or another PDF viewer</li>
                <li>Try exporting in a different format (like CSV)</li>
                <li>Try again with fewer items selected</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  <strong>Need More Help?</strong> If you continue to have problems exporting data, please contact your library system administrator or IT support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "staff-management",
    name: "Staff Management",
    icon: "👨‍💼",
    items: [
      {
        id: "staff-overview",
        title: "Understanding Staff Members",
        content: `<div class="prose prose-blue max-w-none">
          <p class="text-gray-700">The Staff Members section helps you manage all library employees and their system access.</p>
          
          <h3 class="font-medium text-lg mt-6 mb-3">What You Can Do:</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li>View all staff members</li>
            <li>Add new staff members</li>
            <li>Edit staff information</li>
            <li>Change staff roles</li>
            <li>Reset passwords when needed</li>
            <li>Remove staff members when they leave</li>
          </ul>
        </div>`,
      },
      {
        id: "accessing-staff-section",
        title: "How to Find Staff Members",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Opening the Staff Section</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>First, log in with your username and password</li>
            <li>Look at the menu on the left side of your screen</li>
            <li>Find and click on "Staff Members"</li>
            <li>You will now see a list of all staff with their information</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mt-4">
            <p class="text-blue-800 text-sm"><strong>Helpful Tip:</strong> You need administrator privileges to see and use the Staff Members section.</p>
          </div>
        </div>`,
      },
      {
        id: "adding-staff",
        title: "Adding a New Staff Member",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Add a New Staff Member</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Go to the Staff Members page</li>
            <li>Look for the "Add Staff Member" button at the top right</li>
            <li>Click this button to open a form</li>
            <li>Fill in all the information:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li><strong>Full Name:</strong> Enter the staff member's complete name</li>
                <li><strong>Email Address:</strong> Enter their work email address</li>
                <li><strong>Password:</strong> Create a temporary password (they can change it later)</li>
                <li><strong>Role:</strong> Select their job role from the dropdown menu</li>
              </ul>
            </li>
            <li>Click the "Add Staff Member" button at the bottom of the form</li>
          </ol>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-yellow-800 text-sm"><strong>Important:</strong> Make sure to tell the new staff member their password. They'll need it to log in for the first time.</p>
          </div>
        </div>`,
      },
      {
        id: "editing-staff",
        title: "Updating Staff Information",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Changing Staff Details</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>Find the staff member in the list</li>
            <li>Look for the "Edit" button in the Actions column (it has a pencil icon)</li>
            <li>Click this button to open the edit form</li>
            <li>Update their name or email as needed</li>
            <li>Click "Save Changes" when finished</li>
          </ol>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Resetting a Password</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>Either:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>Click the "Edit" button for the staff member, then click "Reset Password" in the form</li>
                <li>Or use the "Reset Password" option directly from the main staff list</li>
              </ul>
            </li>
            <li>Enter a new password for them</li>
            <li>Confirm the password by typing it again</li>
            <li>Click "Reset Password"</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mt-4">
            <p class="text-blue-800 text-sm"><strong>Remember:</strong> Always inform staff members when you've reset their password, and tell them what the new password is.</p>
          </div>
        </div>`,
      },
      {
        id: "roles-management",
        title: "Understanding Staff Roles",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">About Staff Roles</h3>
          <p class="text-gray-700 mb-4">Roles control what staff members can do in the system. Different roles have different permissions.</p>
          
          <h4 class="font-medium mt-4 mb-2">Common Roles Include:</h4>
          <ul class="space-y-2 list-disc pl-5 mb-6">
            <li><strong>Administrator:</strong> Can access everything, including staff management</li>
            <li><strong>Librarian:</strong> Can manage books, students, and loans</li>
            <li><strong>Assistant:</strong> Can check books in and out, but has limited other access</li>
            <li><strong>Read-only:</strong> Can view information but cannot make changes</li>
          </ul>
          
          <h3 class="font-medium text-lg mt-6 mb-3">Changing a Staff Member's Role</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>Find the staff member in the list</li>
            <li>Click the "Change Role" button in the Actions column</li>
            <li>Select the new role from the dropdown menu</li>
            <li>Click "Update Role" to save the change</li>
          </ol>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-yellow-800 text-sm"><strong>Warning:</strong> Changing roles immediately changes what the person can access. Be careful when changing roles, especially when giving someone more access.</p>
          </div>
        </div>`,
      },
      {
        id: "removing-staff",
        title: "Removing Staff Members",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Remove a Staff Member</h3>
          <p class="text-gray-700 mb-4">When someone leaves your organization, you should remove their access:</p>
          
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the staff member in the list</li>
            <li>Click the "Delete" button in the Actions column (it has a trash can icon)</li>
            <li>A confirmation box will appear asking if you're sure</li>
            <li>Review the staff details to ensure you're removing the right person</li>
            <li>Click "Delete Staff Member" to confirm</li>
          </ol>
          
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-red-800 text-sm"><strong>Important:</strong> This action cannot be undone. Once you delete a staff member, they will no longer be able to log into the system.</p>
          </div>
        </div>`,
      },
      {
        id: "searching-staff",
        title: "Finding Specific Staff Members",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Search for Staff</h3>
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>Go to the Staff Members page</li>
            <li>Look for the search box at the top of the staff list</li>
            <li>Type in any of these to find someone:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li>Their name (or part of their name)</li>
                <li>Their email address (or part of it)</li>
                <li>Their role (like "librarian" or "admin")</li>
              </ul>
            </li>
            <li>The list will automatically update to show only matching staff members</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg mt-4">
            <p class="text-blue-800 text-sm"><strong>Helpful Tip:</strong> To see all staff members again, simply clear the search box.</p>
          </div>
        </div>`,
      },
    ],
  },
  {
    id: "library-rules",
    name: "Library Rules",
    icon: "📜",
    items: [
      {
        id: "understanding-rules",
        title: "Understanding Library Rules",
        content: `<div class="prose prose-blue max-w-none">
          <p class="text-gray-700">Library rules help maintain order and ensure everyone can enjoy our resources. This section explains how to use the rules management system.</p>
          
          <h3 class="font-medium text-lg mt-6 mb-3">What Are Library Rules?</h3>
          <p>Library rules are guidelines that everyone must follow while using the library. They cover things like:</p>
          <ul class="space-y-2 list-disc pl-5">
            <li>How to borrow books</li>
            <li>How to behave in the library</li>
            <li>What happens if you return books late</li>
            <li>How to use library resources properly</li>
          </ul>
        </div>`,
      },
      {
        id: "viewing-rules",
        title: "Finding and Viewing Rules",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Find Library Rules</h3>
          <p>You can easily find and read all the library rules:</p>
          
          <ol class="space-y-2 list-decimal pl-5 mb-4">
            <li>Click on the "Library Rules" section in the main menu</li>
            <li>You will see a list of all current rules</li>
            <li>Rules are organized by categories like "Borrowing", "Conduct", "Penalties", and "Resources"</li>
          </ol>
          
          <h4 class="font-medium mt-4 mb-2">Searching for Specific Rules</h4>
          <p>If you're looking for a specific rule:</p>
          <ol class="space-y-2 list-decimal pl-5">
            <li>Type keywords in the search box at the top of the page</li>
            <li>The system will show rules matching your search</li>
          </ol>
          
          <h4 class="font-medium mt-4 mb-2">Filtering Rules by Category</h4>
          <p>To see rules from just one category:</p>
          <ol class="space-y-2 list-decimal pl-5">
            <li>Click on the category dropdown menu next to the search box</li>
            <li>Select the category you want (Borrowing, Conduct, Penalties, or Resources)</li>
            <li>The page will update to show only rules from that category</li>
          </ol>
        </div>`,
      },
      {
        id: "adding-rules",
        title: "Adding New Rules",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Add a New Library Rule</h3>
          <p>If you need to add a new rule to the library system:</p>
          
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Click the "Add Rule" button in the top-right corner</li>
            <li>A window will open where you can enter the new rule</li>
            <li>Fill in these details:
              <ul class="space-y-1 list-disc pl-5 mt-2">
                <li><strong>Rule Title:</strong> A short name for the rule</li>
                <li><strong>Category:</strong> Choose from Borrowing, Conduct, Penalties, or Resources</li>
                <li><strong>Description:</strong> Write out the complete rule in clear, simple language</li>
              </ul>
            </li>
            <li>You'll see a preview of how the rule will look</li>
            <li>When you're satisfied, click the "Add Rule" button</li>
          </ol>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-blue-800 font-medium">Helpful Tip:</p>
            <p class="text-blue-700">Keep rule descriptions clear and easy to understand. Avoid complicated language so everyone can follow the rules.</p>
          </div>
        </div>`,
      },
      {
        id: "editing-rules",
        title: "Changing Existing Rules",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Edit a Library Rule</h3>
          <p>If a rule needs to be updated or corrected:</p>
          
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the rule you want to change in the list</li>
            <li>Click the pencil icon (✏️) on the right side of that rule</li>
            <li>A window will open showing the current rule information</li>
            <li>Make your changes to the title, category, or description</li>
            <li>You'll see a preview of how the updated rule will look</li>
            <li>When you're ready, click "Save Changes"</li>
          </ol>
          
          <h4 class="font-medium mt-4 mb-2">When Should Rules Be Updated?</h4>
          <ul class="space-y-2 list-disc pl-5">
            <li>When policies have changed</li>
            <li>To make the language clearer</li>
            <li>To fix errors or outdated information</li>
            <li>To add more details or examples</li>
          </ul>
        </div>`,
      },
      {
        id: "removing-rules",
        title: "Removing Rules",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">How to Delete a Library Rule</h3>
          <p>When a rule is no longer needed:</p>
          
          <ol class="space-y-2 list-decimal pl-5 mb-6">
            <li>Find the rule you want to remove in the list</li>
            <li>Click the trash can icon (🗑️) on the right side of that rule</li>
            <li>A confirmation window will appear</li>
            <li>Review the rule details to make sure it's the correct one</li>
            <li>Click "Delete Rule" to permanently remove it</li>
          </ol>
          
          <div class="bg-yellow-50 p-4 rounded-lg mb-4">
            <p class="text-yellow-800 font-medium">Important Note:</p>
            <p class="text-yellow-700">Deleting a rule cannot be undone. Make sure you really want to remove the rule before confirming.</p>
          </div>
          
          <h4 class="font-medium mt-4 mb-2">When Should Rules Be Deleted?</h4>
          <ul class="space-y-2 list-disc pl-5">
            <li>When a policy has been discontinued</li>
            <li>When rules have been combined or consolidated</li>
            <li>When a temporary rule is no longer in effect</li>
          </ul>
        </div>`,
      },
      {
        id: "rule-categories",
        title: "Understanding Rule Categories",
        content: `<div class="prose prose-blue max-w-none">
          <h3 class="font-medium text-lg mb-3">Library Rule Categories Explained</h3>
          <p>Rules are organized into four main categories to make them easier to find:</p>
          
          <div class="space-y-4 mt-4">
            <div class="bg-indigo-50 p-3 rounded-lg">
              <h4 class="font-medium text-indigo-800">Borrowing Rules</h4>
              <p class="text-indigo-700">These rules cover how to check out books, how many items you can borrow at once, loan periods, and renewals.</p>
              <p class="text-indigo-700 text-sm mt-1">Example: "Students may borrow up to 5 books at a time for a period of 14 days."</p>
            </div>
            
            <div class="bg-green-50 p-3 rounded-lg">
              <h4 class="font-medium text-green-800">Conduct Rules</h4>
              <p class="text-green-700">These rules explain how people should behave in the library, including noise levels, food and drink policies, and proper use of facilities.</p>
              <p class="text-green-700 text-sm mt-1">Example: "Please maintain quiet in the study areas. Group discussions should only take place in designated areas."</p>
            </div>
            
            <div class="bg-red-50 p-3 rounded-lg">
              <h4 class="font-medium text-red-800">Penalties Rules</h4>
              <p class="text-red-700">These rules describe the consequences for breaking library rules, such as late fees, replacement costs for damaged items, and suspension of borrowing privileges.</p>
              <p class="text-red-700 text-sm mt-1">Example: "Overdue items incur a fee of $0.50 per day up to a maximum of $10 per item."</p>
            </div>
            
            <div class="bg-purple-50 p-3 rounded-lg">
              <h4 class="font-medium text-purple-800">Resources Rules</h4>
              <p class="text-purple-700">These rules cover how to use special library resources like computers, printers, study rooms, and special collections.</p>
              <p class="text-purple-700 text-sm mt-1">Example: "Computer workstations may be used for up to 2 hours per day when others are waiting."</p>
            </div>
          </div>
        </div>`,
      },
    ],
  },
  // More sections can be added here
];

// Function to seed the database
const seedHelpData = async () => {
  try {
    // Clear existing data
    await HelpSection.deleteMany({});
    console.log("Existing help data cleared");

    // Insert new data
    await HelpSection.insertMany(helpData);
    console.log("Help data seeded successfully");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding help data:", error);
    process.exit(1);
  }
};

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:5000/library_management"
  )
  .then(() => {
    console.log("MongoDB connected for seeding...");
    seedHelpData();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
