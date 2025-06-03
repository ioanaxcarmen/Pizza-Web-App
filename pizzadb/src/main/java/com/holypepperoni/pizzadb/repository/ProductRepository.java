package com.holypepperoni.pizzadb.repository;

import com.holypepperoni.pizzadb.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    // Custom Query Method
    List<Product> findByCategory(String category);
}

