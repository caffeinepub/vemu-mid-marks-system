import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserRole = AccessControl.UserRole;

  // Custom application roles
  public type AppRole = {
    #HOD;
    #ClassTeacher;
    #SubjectFaculty;
    #Student;
  };

  public type UserProfile = {
    username : Text;
    passwordHash : Text;
    appRole : AppRole;
    branch : ?Text;
    section : ?Text;
  };

  type Student = {
    rollNumber : Text;
    name : Text;
    course : Text;
    branch : Text;
    semester : Nat;
    section : Text;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.rollNumber, student2.rollNumber);
    };
  };

  type Subject = {
    code : Text;
    name : Text;
    branch : Text;
    semester : Nat;
  };

  module Subject {
    public func compare(subject1 : Subject, subject2 : Subject) : Order.Order {
      Text.compare(subject1.code, subject2.code);
    };
  };

  type Mark = {
    markType : Text;
    markValue : Nat;
    markQuestion : Text;
  };

  type MarkStatus = {
    #Draft;
    #Submitted;
    #Approved;
  };

  module MarkStatus {
    public func compare(status1 : MarkStatus, status2 : MarkStatus) : Order.Order {
      switch (status1, status2) {
        case (#Draft, #Draft) { #equal };
        case (#Draft, _) { #less };
        case (#Submitted, #Draft) { #greater };
        case (#Submitted, #Submitted) { #equal };
        case (#Submitted, #Approved) { #less };
        case (#Approved, #Approved) { #equal };
        case (#Approved, #Draft or #Submitted) { #greater };
      };
    };
  };

  public type MidMarks = {
    student : Student;
    subject : Subject;
    midExam : Text;
    marks : [Mark];
    status : MarkStatus;
    creator : Principal;
  };

  module MidMarks {
    public func compare(marks1 : MidMarks, marks2 : MidMarks) : Order.Order {
      Text.compare(marks1.student.rollNumber, marks2.student.rollNumber);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let studentPrincipalMap = Map.empty<Text, Principal>();
  let students = Map.empty<Text, Student>();
  let subjects = Map.empty<Text, Subject>();
  let marks = Map.empty<Text, MidMarks>();

  // Helper functions for authorization
  func getUserProfile(principal : Principal) : ?UserProfile {
    userProfiles.get(principal);
  };

  func isHOD(caller : Principal) : Bool {
    switch (getUserProfile(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#HOD) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isClassTeacher(caller : Principal) : Bool {
    switch (getUserProfile(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#ClassTeacher) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isSubjectFaculty(caller : Principal) : Bool {
    switch (getUserProfile(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#SubjectFaculty) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isStudent(caller : Principal) : Bool {
    switch (getUserProfile(caller)) {
      case (?profile) {
        switch (profile.appRole) {
          case (#Student) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func canApprove(caller : Principal) : Bool {
    isHOD(caller) or isClassTeacher(caller);
  };

  func getStudentRollNumber(caller : Principal) : ?Text {
    for ((rollNumber, principal) in studentPrincipalMap.entries()) {
      if (Principal.equal(principal, caller)) {
        return ?rollNumber;
      };
    };
    null;
  };

  func hasAccessToBranchSection(caller : Principal, branch : Text, section : Text) : Bool {
    switch (getUserProfile(caller)) {
      case (?profile) {
        switch (profile.branch, profile.section) {
          case (?userBranch, ?userSection) {
            userBranch == branch and userSection == section;
          };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfilePublic(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student Management
  public shared ({ caller }) func addStudent(rollNumber : Text, name : Text, course : Text, branch : Text, semester : Nat, section : Text, studentPrincipal : ?Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    let student : Student = {
      rollNumber;
      name;
      course;
      branch;
      semester;
      section;
    };
    students.add(rollNumber, student);
    
    switch (studentPrincipal) {
      case (?principal) {
        studentPrincipalMap.add(rollNumber, principal);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getStudent(rollNumber : Text) : async Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };

    // Students can only view their own record
    if (isStudent(caller)) {
      switch (getStudentRollNumber(caller)) {
        case (?studentRoll) {
          if (studentRoll != rollNumber) {
            Runtime.trap("Unauthorized: Students can only view their own record");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: Student record not found");
        };
      };
    };

    switch (students.get(rollNumber)) {
      case (null) {
        Runtime.trap("Student does not exist");
      };
      case (?student) { student };
    };
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };

    // Students cannot view all students
    if (isStudent(caller)) {
      Runtime.trap("Unauthorized: Students cannot view all student records");
    };

    students.values().toArray().sort();
  };

  public query ({ caller }) func getStudentsByBranchSectionSemester(branch : Text, section : Text, semester : Nat) : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query students");
    };

    // Faculty must have access to the branch/section
    if (not (isHOD(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      if (not hasAccessToBranchSection(caller, branch, section)) {
        Runtime.trap("Unauthorized: You don't have access to this branch/section");
      };
    };

    let filtered = students.values().toArray().filter(
      func(s : Student) : Bool {
        s.branch == branch and s.section == section and s.semester == semester;
      },
    );
    filtered.sort();
  };

  // Subject Management
  public shared ({ caller }) func addSubject(code : Text, name : Text, branch : Text, semester : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add subjects");
    };
    let subject : Subject = {
      code;
      name;
      branch;
      semester;
    };
    subjects.add(code, subject);
  };

  public query ({ caller }) func getSubject(code : Text) : async Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subjects");
    };
    switch (subjects.get(code)) {
      case (null) { Runtime.trap("Subject does not exist") };
      case (?subject) { subject };
    };
  };

  public query ({ caller }) func getAllSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subjects");
    };
    subjects.values().toArray().sort();
  };

  // Marks Management
  public shared ({ caller }) func createMidMarks(student : Student, subject : Subject, midExam : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create marks");
    };

    // Only SubjectFaculty can create marks
    if (not isSubjectFaculty(caller)) {
      Runtime.trap("Unauthorized: Only Subject Faculty can create marks");
    };

    // Check if faculty has access to this branch/section
    if (not hasAccessToBranchSection(caller, student.branch, student.section)) {
      Runtime.trap("Unauthorized: You don't have access to this branch/section");
    };

    let midMarks : MidMarks = {
      student;
      subject;
      midExam;
      marks = [];
      status = #Draft;
      creator = caller;
    };
    let key = student.rollNumber # "_" # subject.code # "_" # midExam;
    marks.add(key, midMarks);
    key;
  };

  public shared ({ caller }) func updateMidMarks(key : Text, newMarks : [Mark]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update marks");
    };

    switch (marks.get(key)) {
      case (null) { Runtime.trap("Mid marks entry does not exist") };
      case (?midMarks) {
        // Only the creator (SubjectFaculty) can update
        if (not Principal.equal(caller, midMarks.creator)) {
          Runtime.trap("Unauthorized: Only the creator can update marks");
        };

        // Can only update if status is Draft
        switch (midMarks.status) {
          case (#Draft) {
            let updated : MidMarks = {
              student = midMarks.student;
              subject = midMarks.subject;
              midExam = midMarks.midExam;
              marks = newMarks;
              status = midMarks.status;
              creator = midMarks.creator;
            };
            marks.add(key, updated);
          };
          case (_) {
            Runtime.trap("Unauthorized: Cannot update marks that are not in Draft status");
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitMidMarks(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit marks");
    };

    switch (marks.get(key)) {
      case (null) { Runtime.trap("Mid marks entry does not exist") };
      case (?midMarks) {
        // Only the creator (SubjectFaculty) can submit
        if (not Principal.equal(caller, midMarks.creator)) {
          Runtime.trap("Unauthorized: Only the creator can submit marks");
        };

        // Can only submit if status is Draft
        switch (midMarks.status) {
          case (#Draft) {
            let updated : MidMarks = {
              student = midMarks.student;
              subject = midMarks.subject;
              midExam = midMarks.midExam;
              marks = midMarks.marks;
              status = #Submitted;
              creator = midMarks.creator;
            };
            marks.add(key, updated);
          };
          case (_) {
            Runtime.trap("Cannot submit marks that are not in Draft status");
          };
        };
      };
    };
  };

  public shared ({ caller }) func approveMidMarks(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can approve marks");
    };

    // Only HOD or ClassTeacher can approve
    if (not canApprove(caller)) {
      Runtime.trap("Unauthorized: Only HOD or Class Teacher can approve marks");
    };

    switch (marks.get(key)) {
      case (null) { Runtime.trap("Mid marks entry does not exist") };
      case (?midMarks) {
        // Check if approver has access to this branch/section
        if (not (isHOD(caller) or hasAccessToBranchSection(caller, midMarks.student.branch, midMarks.student.section))) {
          Runtime.trap("Unauthorized: You don't have access to this branch/section");
        };

        // Can only approve if status is Submitted
        switch (midMarks.status) {
          case (#Submitted) {
            let updated : MidMarks = {
              student = midMarks.student;
              subject = midMarks.subject;
              midExam = midMarks.midExam;
              marks = midMarks.marks;
              status = #Approved;
              creator = midMarks.creator;
            };
            marks.add(key, updated);
          };
          case (_) {
            Runtime.trap("Cannot approve marks that are not in Submitted status");
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectMidMarks(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can reject marks");
    };

    // Only HOD or ClassTeacher can reject
    if (not canApprove(caller)) {
      Runtime.trap("Unauthorized: Only HOD or Class Teacher can reject marks");
    };

    switch (marks.get(key)) {
      case (null) { Runtime.trap("Mid marks entry does not exist") };
      case (?midMarks) {
        // Check if approver has access to this branch/section
        if (not (isHOD(caller) or hasAccessToBranchSection(caller, midMarks.student.branch, midMarks.student.section))) {
          Runtime.trap("Unauthorized: You don't have access to this branch/section");
        };

        // Can only reject if status is Submitted
        switch (midMarks.status) {
          case (#Submitted) {
            let updated : MidMarks = {
              student = midMarks.student;
              subject = midMarks.subject;
              midExam = midMarks.midExam;
              marks = midMarks.marks;
              status = #Draft;
              creator = midMarks.creator;
            };
            marks.add(key, updated);
          };
          case (_) {
            Runtime.trap("Cannot reject marks that are not in Submitted status");
          };
        };
      };
    };
  };

  public query ({ caller }) func getMidMarks(key : Text) : async MidMarks {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view marks");
    };

    switch (marks.get(key)) {
      case (null) { Runtime.trap("Mid marks entry does not exist") };
      case (?midMarks) {
        // Students can only view their own marks
        if (isStudent(caller)) {
          switch (getStudentRollNumber(caller)) {
            case (?rollNumber) {
              if (rollNumber != midMarks.student.rollNumber) {
                Runtime.trap("Unauthorized: Students can only view their own marks");
              };
            };
            case (null) {
              Runtime.trap("Unauthorized: Student record not found");
            };
          };
        } else {
          // Faculty must have access to the branch/section
          if (not (isHOD(caller) or AccessControl.isAdmin(accessControlState, caller))) {
            if (not hasAccessToBranchSection(caller, midMarks.student.branch, midMarks.student.section)) {
              Runtime.trap("Unauthorized: You don't have access to this branch/section");
            };
          };
        };

        midMarks;
      };
    };
  };

  public query ({ caller }) func getAllMarks() : async [MidMarks] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view marks");
    };

    // Students can only view their own marks
    if (isStudent(caller)) {
      switch (getStudentRollNumber(caller)) {
        case (?rollNumber) {
          let filtered = marks.values().toArray().filter(
            func(m : MidMarks) : Bool {
              m.student.rollNumber == rollNumber;
            },
          );
          return filtered.sort();
        };
        case (null) {
          Runtime.trap("Unauthorized: Student record not found");
        };
      };
    };

    marks.values().toArray().sort();
  };

  public query ({ caller }) func getMarksByBranchSectionSemesterSubject(branch : Text, section : Text, semester : Nat, subjectCode : Text) : async [MidMarks] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query marks");
    };

    // Students cannot use this query
    if (isStudent(caller)) {
      Runtime.trap("Unauthorized: Students cannot query marks by branch/section");
    };

    // Faculty must have access to the branch/section
    if (not (isHOD(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      if (not hasAccessToBranchSection(caller, branch, section)) {
        Runtime.trap("Unauthorized: You don't have access to this branch/section");
      };
    };

    let filtered = marks.values().toArray().filter(
      func(m : MidMarks) : Bool {
        m.student.branch == branch and m.student.section == section and m.student.semester == semester and m.subject.code == subjectCode;
      },
    );
    filtered.sort();
  };

  // Initialize seed data
  func initializeSeedData() {
    // This would be called during canister initialization
    // Seed data initialization would go here
  };
};
