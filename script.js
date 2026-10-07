
/*
  INTRAMURALS ATTENDANCE - DEMO VERSION

  Sample data only.
  No real authentication or cloud database yet.
*/

const studentsBySection = {
  "1A6-IT": [
    "Juan Dela Cruz",
    "Maria Santos",
    "Pedro Reyes"
  ],
  "1A7-IT": [
    "Ana Garcia",
    "Mark Lopez",
    "Sofia Ramos"
  ],
  "1A8-IT": [
    "Carlo Mendoza",
    "Bea Torres",
    "Luis Flores"
  ]
};

let currentSection = "";
let currentRepresentative = "";
let selectedStudent = "";
let selectedPhoto = null;
let photoPreviewUrl = "";

const attendanceRecords = Object.create(null);

const $ = id => document.getElementById(id);

$("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  login();
});

$("logoutBtn").addEventListener("click", logout);
$("cancelPhotoBtn").addEventListener("click", closePhoto);
$("submitPhotoBtn").addEventListener("click", submitAttendance);
$("searchStudent").addEventListener("input", showStudents);
$("photoInput").addEventListener("change", previewPhoto);

function login() {
  const name = $("representative").value.trim();
  const section = $("section").value;

  if (!name || !studentsBySection[section]) {
    $("loginMessage").textContent =
      "Please enter a representative name and select a section.";
    return;
  }

  currentSection = section;
  currentRepresentative = name;

  $("loginMessage").textContent = "";
  $("loginCard").hidden = true;
  $("attendance").hidden = false;

  $("sectionTitle").textContent =
    section + " Attendance Dashboard";

  $("representativeInfo").textContent =
    "Representative: " + name;

  $("searchStudent").value = "";

  showStudents();

  $("attendance").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showStudents() {
  if (!currentSection) return;

  const list = $("studentList");
  const students = studentsBySection[currentSection] || [];
  const search = $("searchStudent").value.trim().toLowerCase();

  list.replaceChildren();

  let present = 0;

  students.forEach(student => {
    const key = currentSection + "|" + student;
    const record = attendanceRecords[key];

    if (record) present++;

    if (!student.toLowerCase().includes(search)) return;

    const div = document.createElement("div");
    div.className = "student";

    const title = document.createElement("strong");
    title.textContent = student;

    const status = document.createElement("p");
    status.className = record
      ? "status-present"
      : "status-pending";

    status.textContent = record
      ? "PRESENT"
      : "NOT YET RECORDED";

    div.append(title, status);

    if (record) {
      const time = document.createElement("p");
      time.textContent = "Recorded: " + record.time;

      const rep = document.createElement("p");
      rep.textContent = "Submitted by: " + record.representative;

      const evidence = document.createElement("img");
      evidence.className = "evidence";
      evidence.src = record.photo;
      evidence.alt = "Attendance photo for " + student;

      div.append(time, rep, evidence);
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Take / Upload Photo";

      button.addEventListener("click", () => {
        openPhoto(student);
      });

      div.appendChild(button);
    }

    list.appendChild(div);
  });

  $("totalCount").textContent = students.length;
  $("presentCount").textContent = present;
  $("pendingCount").textContent = students.length - present;

  if (list.children.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No students found.";
    list.appendChild(empty);
  }
}

function openPhoto(student) {
  selectedStudent = student;
  selectedPhoto = null;

  $("selectedStudent").textContent =
    "Selected student: " + student;

  $("photoInput").value = "";
  $("photoMessage").textContent = "";

  clearPreview();

  $("photoCard").hidden = false;

  $("photoCard").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function previewPhoto(event) {
  const file = event.target.files[0];

  selectedPhoto = null;
  clearPreview();
  $("photoMessage").textContent = "";

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    $("photoMessage").textContent =
      "Please choose a valid image file.";
    $("photoInput").value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    $("photoMessage").textContent =
      "The image must be smaller than 5 MB.";
    $("photoInput").value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result !== "string") {
      $("photoMessage").textContent =
        "Unable to preview this image.";
      return;
    }

    photoPreviewUrl = reader.result;
    selectedPhoto = file;

    $("photoPreview").src = photoPreviewUrl;
    $("photoPreview").hidden = false;
  };

  reader.onerror = () => {
    selectedPhoto = null;
    $("photoMessage").textContent =
      "Could not read the image. Please try again.";
  };

  reader.readAsDataURL(file);
}

function submitAttendance() {
  if (!currentSection || !selectedStudent || !selectedPhoto) {
    $("photoMessage").textContent =
      "Please select a student and preview their photo first.";
    return;
  }

  const key = currentSection + "|" + selectedStudent;

  if (attendanceRecords[key]) {
    $("photoMessage").textContent =
      "Attendance has already been recorded for this student.";
    return;
  }

  const students = studentsBySection[currentSection] || [];

  if (!students.includes(selectedStudent)) {
    $("photoMessage").textContent =
      "This student does not belong to the selected section.";
    return;
  }

  const confirmed = confirm(
    "Submit this photo for " + selectedStudent + "?"
  );

  if (!confirmed) return;

  if (!photoPreviewUrl) {
    $("photoMessage").textContent =
      "Please wait for the photo preview to finish.";
    return;
  }

  const button = $("submitPhotoBtn");
  button.disabled = true;
  button.textContent = "Saving demo attendance...";

  /*
    DEMO ONLY:
    This saves the record in browser memory.
    A real system must upload to Firebase Storage
    and save the database record before marking PRESENT.
  */

  try {
    attendanceRecords[key] = {
      section: currentSection,
      student: selectedStudent,
      representative: currentRepresentative,
      photo: photoPreviewUrl,
      time: new Date().toLocaleString()
    };

    closePhoto();
    showStudents();
  } catch (error) {
    $("photoMessage").textContent =
      "Unable to record attendance. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Confirm and Submit";
  }
}

function clearPreview() {
  $("photoPreview").removeAttribute("src");
  $("photoPreview").hidden = true;
  photoPreviewUrl = "";
}

function closePhoto() {
  $("photoCard").hidden = true;
  $("photoInput").value = "";
  $("photoMessage").textContent = "";

  selectedPhoto = null;
  selectedStudent = "";

  clearPreview();
}

function logout() {
  closePhoto();

  currentSection = "";
  currentRepresentative = "";

  $("attendance").hidden = true;
  $("loginCard").hidden = false;
  $("representative").value = "";
  $("searchStudent").value = "";
  $("loginMessage").textContent = "";
}