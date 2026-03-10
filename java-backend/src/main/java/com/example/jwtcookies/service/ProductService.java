package com.example.jwtcookies.service;

import com.example.jwtcookies.dto.ProductRequest;
import com.example.jwtcookies.exception.ApiException;
import com.example.jwtcookies.model.Product;
import com.example.jwtcookies.repository.ProductRepository;
import com.example.jwtcookies.security.SecurityUtils;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    public ProductService(ProductRepository productRepository, MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Map<String, Object> createProduct(ProductRequest request) {
        if (!StringUtils.hasText(request.productName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product name is required");
        }
        if (request.price() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Price is required");
        }
        if (request.price() < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Price must be greater than or equal to 0");
        }

        Product product = new Product();
        applyRequest(product, request, true);
        product.setCreatedBy(SecurityUtils.currentUserId());

        Product created = productRepository.save(product);

        return Map.of(
                "message", "Product created successfully",
                "product", created
        );
    }

    public Map<String, Object> getProducts(Integer page, Integer limit, String search) {
        int pageNum = (page == null || page < 1) ? 1 : page;
        int limitNum = (limit == null || limit < 1) ? 10 : limit;

        Query query = new Query();
        if (StringUtils.hasText(search)) {
            query.addCriteria(Criteria.where("productName").regex(search, "i"));
        }

        long total = mongoTemplate.count(query, Product.class);

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.skip((long) (pageNum - 1) * limitNum);
        query.limit(limitNum);

        List<Product> products = mongoTemplate.find(query, Product.class);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("page", pageNum);
        meta.put("limit", limitNum);
        meta.put("total", total);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", products);
        response.put("meta", meta);

        return response;
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public Map<String, Object> updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        applyRequest(product, request, false);
        product.setUpdatedBy(SecurityUtils.currentUserId());

        Product updated = productRepository.save(product);

        return Map.of(
                "message", "Product updated successfully",
                "product", updated
        );
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

    private void applyRequest(Product product, ProductRequest request, boolean creating) {
        if (creating || request.productName() != null) {
            if (!StringUtils.hasText(request.productName())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Product name is required");
            }
            product.setProductName(request.productName().trim());
        }

        if (creating || request.price() != null) {
            if (request.price() == null || request.price() < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Price must be greater than or equal to 0");
            }
            product.setPrice(request.price());
        }

        if (creating || request.quantity() != null) {
            Integer quantity = request.quantity() == null ? 0 : request.quantity();
            if (quantity < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be greater than or equal to 0");
            }
            product.setQuantity(quantity);
        }

        if (creating || request.imageUrl() != null) {
            product.setImageUrl(trimToDefault(request.imageUrl(), ""));
        }
    }

    private String trimToDefault(String value, String fallback) {
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        return value.trim();
    }
}
