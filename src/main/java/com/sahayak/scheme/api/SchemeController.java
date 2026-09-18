package com.sahayak.scheme.api;

import com.sahayak.scheme.domain.Scheme;
import com.sahayak.scheme.domain.SchemeRule;
import com.sahayak.scheme.domain.SchemeStatus;
import com.sahayak.scheme.dto.*;
import com.sahayak.scheme.service.SchemeMapper;
import com.sahayak.scheme.service.SchemeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schemes")
public class SchemeController {

    private final SchemeService schemeService;
    private final SchemeMapper schemeMapper;

    public SchemeController(SchemeService schemeService, SchemeMapper schemeMapper) {
        this.schemeService = schemeService;
        this.schemeMapper = schemeMapper;
    }

    @PostMapping
    public ResponseEntity<SchemeResponse> create(@RequestBody @Valid CreateSchemeRequest request,
                                                 @RequestHeader(value = "X-Actor", defaultValue = "system") String actor) {
        Scheme scheme = schemeService.createScheme(request, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(schemeMapper.toSchemeResponse(scheme));
    }

    @GetMapping
    public List<SchemeResponse> getSchemes(@RequestParam(value = "status", required = false) SchemeStatus status,
                                           @RequestParam(value = "name", required = false) String name) {
        return schemeService.getSchemes(status, name).stream().map(schemeMapper::toSchemeResponse).toList();
    }

    @GetMapping("/{schemeId}")
    public SchemeResponse getScheme(@PathVariable Long schemeId) {
        return schemeMapper.toSchemeResponse(schemeService.getScheme(schemeId));
    }

    @GetMapping("/{schemeId}/rules")
    public List<RuleResponse> getRules(@PathVariable Long schemeId) {
        List<SchemeRule> rules = schemeService.getRules(schemeId);
        return rules.stream().map(schemeMapper::toRuleResponse).toList();
    }

    @GetMapping("/{schemeId}/source")
    public SourceMetadataResponse getSource(@PathVariable Long schemeId) {
        return schemeMapper.toSourceMetadata(schemeService.getScheme(schemeId));
    }

    @PutMapping("/{schemeId}/rules/{ruleId}")
    public RuleResponse editRule(@PathVariable Long schemeId,
                                 @PathVariable Long ruleId,
                                 @RequestBody @Valid EditRuleRequest request) {
        return schemeMapper.toRuleResponse(schemeService.editRule(schemeId, ruleId, request));
    }

    @PostMapping("/{schemeId}/review/approve")
    public SchemeResponse approveScheme(@PathVariable Long schemeId, @RequestBody @Valid ReviewActionRequest request) {
        return schemeMapper.toSchemeResponse(schemeService.approveScheme(schemeId, request));
    }

    @PostMapping("/{schemeId}/review/archive")
    public SchemeResponse archiveScheme(@PathVariable Long schemeId, @RequestBody @Valid ReviewActionRequest request) {
        return schemeMapper.toSchemeResponse(schemeService.archiveScheme(schemeId, request));
    }
}
