package kr.nextvision.web.config; // 본인의 패키지 경로에 맞게 수정해 주세요.

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 네이버 클라우드 오브젝트 스토리지 연결을 위한 설정 클래스
 * AWS S3 클라이언트를 활용하여 NCP와 통신합니다.
 */
@Configuration
public class NcpStorageConfig {

    // application.properties에 설정한 값들을 불러옵니다.
    @Value("${ncp.storage.access-key}")
    private String accessKey;

    @Value("${ncp.storage.secret-key}")
    private String secretKey;

    @Value("${ncp.storage.region}")
    private String region;

    @Value("${ncp.storage.endpoint}")
    private String endpoint;

    /**
     * AmazonS3 객체를 스프링 빈(Bean)으로 등록하여 
     * 파일 업로드 서비스에서 주입받아 사용할 수 있도록 합니다.
     */
    @Bean
    public AmazonS3 amazonS3() {
        // 1. 자격 증명 객체 생성 (Access Key, Secret Key 셋팅)
        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);

        // 2. NCP 엔드포인트 및 리전 설정
        AwsClientBuilder.EndpointConfiguration endpointConfiguration = 
                new AwsClientBuilder.EndpointConfiguration(endpoint, region);

        // 3. AmazonS3 클라이언트 조립 및 반환
        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(endpointConfiguration)
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }
}