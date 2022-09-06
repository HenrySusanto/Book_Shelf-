let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'APPS_BOOK_Shelf';
const notBtn = document.querySelector(".bookNotSubmit");
const btnAcc = document.querySelector(".bookSubmit");
const notcompleteBookshelfList = document.querySelector(".incompleteBookshelfList");
const completeBookshelfList = document.querySelector(".completeBookshelfList");
const textTitle = document.getElementById("inputBookTitle");
const textAuthor = document.getElementById("inputBookAuthor");
const textYear = document.getElementById("inputBookYear");



function addBook(paramIsComp) {
  const titleValue = textTitle.value;
  const authorValue = textAuthor.value;
  const yearValue = textYear.value;
  const paramIsComplete = paramIsComp;
  const generatedID = generateID();
  const bookObject = generateBookObject(
    generatedID,
    titleValue,
    authorValue,
    yearValue,
    paramIsComplete
    );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateID() {
  return +new Date();
}

function generateBookObject(id, textTitle, textAuthor, textYear, isComplete) {
  return {
    id,
    textTitle,
    textAuthor,
    textYear,
    isComplete
  }
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.textTitle;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis: ' + bookObject.textAuthor;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun: ' + bookObject.textYear;

  const textContainer = document.createElement('article');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);
  textContainer.setAttribute('id', `book-${bookObject.id}`);

  const btnSwitch = document.createElement("button");
  btnSwitch.classList.add("switch-button");

  if (bookObject.isComplete) {
    btnSwitch.innerText = 'Belum selesai dibaca';
    btnSwitch.addEventListener('click', function () {
      addNotToCompleted(bookObject.id);
    });
  } else {
    btnSwitch.innerText = 'Selesai dibaca';
    btnSwitch.addEventListener('click', function () {
      addCheckToCompleted(bookObject.id);
    });
  }

  const btnDelete = document.createElement("button");
  btnDelete.classList.add("delete-button");
  btnDelete.innerText = "Hapus Buku";
  btnDelete.addEventListener("click", function () {
    Swal.fire({
      title: 'Are you sure?',
      text: "if you delete the data, data will be lost !!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
        removeBook(bookObject.id);
      }
      else {
        return;
      }
    }),
      saveData();
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  buttonContainer.append(btnSwitch, btnDelete);
  textContainer.append(buttonContainer);
  return textContainer;
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  notcompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";
  textTitle.value = "";
  textAuthor.value = "";
  textYear.value = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) notcompleteBookshelfList.append(bookElement);
    else completeBookshelfList.append(bookElement);
  }
});

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addCheckToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function addNotToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
}

function searchBooks() {
  const title = document.getElementById('searchBookTitle').value;
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);
  const searchedBooks = data.filter(function (book) {
    return book.textTitle.toLowerCase().includes(title);
  });

  if (searchedBooks.length === 0) {
    alert('Buku tidak ditemukan!');
    return location.reload();
  }

  if (title !== '') {
    books = [];
    for (const book of searchedBooks) {
      books.push(book);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    books = [];
    loadDataFromStorage();
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

if (isStorageExist()) {
  loadDataFromStorage();
}

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    Swal.fire('Browser kamu tidak mendukung local storage')
    return false;
  }
  return true;

}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchSubmit = document.getElementById('searchBook');
  
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const isComplete = event.submitter;

    if (isComplete === notBtn) {
      addBook(false);
    } else if (isComplete === btnAcc) {
      addBook(true);
    }

  });

  searchSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });
  
});