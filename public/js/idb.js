let db;

const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function (e) {
    const db = e.target.result;

    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function (e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function (e) {
    console.log(e.target.onerror)
}

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget')

    budgetObjectStore.add(record)
};

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget')

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(serverRes => {
                    if (serverRes.message) {
                        throw new Error(serverRes);
                    }
                    const transaction = db.transaction(['new_budget'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('new_budget')

                    budgetObjectStore.clear();

                    alert('All budgets have been submitted!')
                })
                .catch(err => {
                    console.log
                })
        }
    }
}

window.addEventListener('online', uploadBudget)