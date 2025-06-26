package com.holypepperoni.pizzadb.model;
//import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
public class Customer {
    private String CustomerID;
    private Float latitude;
    private Float longitude;
}
