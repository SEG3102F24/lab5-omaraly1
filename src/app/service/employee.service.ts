import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../model/employee';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  employees$: BehaviorSubject<readonly Employee[]> = new BehaviorSubject<
    readonly Employee[]
  >([]);

  private firestoreCollection = collection(this.firestore, 'employees');

  constructor(private firestore: Firestore) {
    this.loadEmployeesFromFirestore();
  }

  get getEmployees(): Observable<readonly Employee[]> {
    return this.employees$;
  }

  async loadEmployeesFromFirestore() {
    try {
      const snapshot = await getDocs(this.firestoreCollection);
      const employees = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'],
          dateOfBirth: data['dateOfBirth'].toDate(),
          city: data['city'],
          salary: data['salary'],
          gender: data['gender'],
          email: data['email'],
        } as Employee;
      });
      this.employees$.next(employees);
    } catch (error) {
      console.error('Error loading employees from Firestore:', error);
    }
  }

  async addEmployee(employee: Employee) {
    try {
      await addDoc(this.firestoreCollection, {
        name: employee.name,
        dateOfBirth: employee.dateOfBirth,
        city: employee.city,
        salary: employee.salary,
        gender: employee.gender,
        email: employee.email,
      });

      this.employees$.next([...this.employees$.getValue(), employee]);
      return true;
    } catch (error) {
      console.error('Error adding employee to Firestore: ', error);
      return false;
    }
  }
}
