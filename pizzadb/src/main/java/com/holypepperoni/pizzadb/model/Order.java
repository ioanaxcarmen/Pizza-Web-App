package com.holypepperoni.pizzadb.model;
//import java.time.LocalDate;

import java.sql.Date;

import jakarta.persistence.*;


@Entity
public class Order {
    private String orderID;
    private Date orderDate;
    private String customerID;
    private String storeID;
    private int nItems;
    private Float total;
}
