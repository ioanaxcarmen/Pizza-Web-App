package com.holypepperoni.pizzadb.model;
//import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
public class Store {
    private String StoreID;
    private String Zipcode;
    private String stateAbb;
    private Float latitude;
    private Float longitude; 
    private String City;
    private String state;
    private Float distance;


}
