package com.example.jwtcookies.controller;

import com.example.jwtcookies.dto.ClientRequest;
import com.example.jwtcookies.model.Client;
import com.example.jwtcookies.service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<Map<String, Object>> getClients(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(clientService.getClients(page, limit, search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<Client> getClientById(@PathVariable String id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT_CREATE')")
    public ResponseEntity<Map<String, Object>> createClient(@RequestBody ClientRequest request) {
        return ResponseEntity.status(201).body(clientService.createClient(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> updateClient(@PathVariable String id, @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_DELETE')")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
