package com.holypepperoni.pizzadb.controller;

import com.holypepperoni.pizzadb.model.Product;
import com.holypepperoni.pizzadb.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // GET all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET product by SKU
    @GetMapping("/{sku}")
    public Product getProduct(@PathVariable String sku) {
        return productRepository.findById(sku).orElse(null);
    }

    // POST new product
    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // DELETE product by SKU
    @DeleteMapping("/{sku}")
    public void deleteProduct(@PathVariable String sku) {
        productRepository.deleteById(sku);
    }
}

