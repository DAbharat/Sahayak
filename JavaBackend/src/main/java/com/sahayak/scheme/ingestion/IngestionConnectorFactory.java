package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IngestionConnectorFactory {

    private final List<IngestionConnector> connectors;

    public IngestionConnectorFactory(List<IngestionConnector> connectors) {
        this.connectors = connectors;
    }

    public IngestionConnector getConnector(SourceType sourceType) {
        return connectors.stream()
                .filter(connector -> connector.supports(sourceType))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No connector for source type: " + sourceType));
    }
}
