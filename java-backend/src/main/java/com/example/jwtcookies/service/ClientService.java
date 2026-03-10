package com.example.jwtcookies.service;

import com.example.jwtcookies.dto.ClientRequest;
import com.example.jwtcookies.exception.ApiException;
import com.example.jwtcookies.model.Client;
import com.example.jwtcookies.model.ClientAddress;
import com.example.jwtcookies.repository.ClientRepository;
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
public class ClientService {

    private final ClientRepository clientRepository;
    private final MongoTemplate mongoTemplate;

    public ClientService(ClientRepository clientRepository, MongoTemplate mongoTemplate) {
        this.clientRepository = clientRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Map<String, Object> createClient(ClientRequest request) {
        if (!StringUtils.hasText(request.name())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Client name is required");
        }

        Client client = new Client();
        applyRequest(client, request, true);
        client.setCreatedBy(SecurityUtils.currentUserId());

        Client created = clientRepository.save(client);

        return Map.of(
                "message", "Client created successfully",
                "client", created
        );
    }

    public Map<String, Object> getClients(Integer page, Integer limit, String search) {
        int pageNum = (page == null || page < 1) ? 1 : page;
        int limitNum = (limit == null || limit < 1) ? 10 : limit;

        Query query = new Query();
        if (StringUtils.hasText(search)) {
            query.addCriteria(Criteria.where("name").regex(search, "i"));
        }

        long total = mongoTemplate.count(query, Client.class);

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.skip((long) (pageNum - 1) * limitNum);
        query.limit(limitNum);

        List<Client> clients = mongoTemplate.find(query, Client.class);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("page", pageNum);
        meta.put("limit", limitNum);
        meta.put("total", total);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", clients);
        response.put("meta", meta);

        return response;
    }

    public Client getClientById(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    public Map<String, Object> updateClient(String id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Client not found"));

        applyRequest(client, request, false);
        client.setUpdatedBy(SecurityUtils.currentUserId());

        Client updated = clientRepository.save(client);

        return Map.of(
                "message", "Client updated successfully",
                "client", updated
        );
    }

    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Client not found");
        }
        clientRepository.deleteById(id);
    }

    private void applyRequest(Client client, ClientRequest request, boolean creating) {
        if (creating || request.name() != null) {
            if (!StringUtils.hasText(request.name())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Client name is required");
            }
            client.setName(request.name().trim());
        }

        if (creating || request.email() != null) {
            client.setEmail(normalizeEmail(request.email()));
        }

        if (creating || request.phone() != null) {
            client.setPhone(trimToNull(request.phone()));
        }

        if (creating || request.address() != null) {
            client.setAddress(copyAddress(request.address()));
        }

        if (creating || request.status() != null) {
            String status = StringUtils.hasText(request.status()) ? request.status().trim().toUpperCase() : "ACTIVE";
            if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Status must be ACTIVE or INACTIVE");
            }
            client.setStatus(status);
        }
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private ClientAddress copyAddress(ClientAddress address) {
        if (address == null) {
            return null;
        }

        ClientAddress cloned = new ClientAddress();
        cloned.setLine1(trimToNull(address.getLine1()));
        cloned.setLine2(trimToNull(address.getLine2()));
        cloned.setCity(trimToNull(address.getCity()));
        cloned.setState(trimToNull(address.getState()));
        cloned.setCountry(trimToNull(address.getCountry()));
        cloned.setZip(trimToNull(address.getZip()));
        return cloned;
    }
}
