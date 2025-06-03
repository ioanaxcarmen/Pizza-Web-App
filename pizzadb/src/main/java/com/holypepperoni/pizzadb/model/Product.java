package com.holypepperoni.pizzadb.model;

import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
public class Product {

    private String sku;
    private String name;
    private double price;
    private String category;
    private String size;
    private String ingredient;
    private LocalDate launch;

    // === Konstruktoren ===
    public Product() {}

    public Product(String sku, String name, double price, String category, String size, String ingredient, LocalDate launch) {
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.category = category;
        this.size = size;
        this.ingredient = ingredient;
        this.launch = launch;
    }

    // === Getter & Setter ===

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getIngredient() {
        return ingredient;
    }

    public void setIngredient(String ingredient) {
        this.ingredient = ingredient;
    }

    public LocalDate getLaunch() {
        return launch;
    }

    public void setLaunch(LocalDate launch) {
        this.launch = launch;
    }

    
}
