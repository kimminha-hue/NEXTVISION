package kr.nextvision.web.dto;

import java.util.List;

public class QueryResponse {

    private String status;
    private List<String> product_ids;
    private List<String> documents;
    private List<Double> distances;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getProduct_ids() {
        return product_ids;
    }

    public void setProduct_ids(List<String> product_ids) {
        this.product_ids = product_ids;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public List<Double> getDistances() {
        return distances;
    }

    public void setDistances(List<Double> distances) {
        this.distances = distances;
    }
}