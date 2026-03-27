package kr.nextvision.web.service; // 본인의 패키지 경로에 맞게 수정해 주세요.

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

/**
 * 프론트엔드에서 전달받은 파일을 네이버 클라우드로 업로드하는 서비스
 */
@Service
public class FileUploadService {

    private final AmazonS3 amazonS3;

    @Value("${ncp.storage.bucket}")
    private String bucketName;

    // 생성자를 통한 AmazonS3 객체 의존성 주입 (Config 클래스에서 만든 객체를 받아옵니다)
    public FileUploadService(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    /**
     * 파일을 NCP 오브젝트 스토리지에 업로드하고 접근 가능한 URL을 반환합니다.
     * * @param multipartFile 프론트엔드에서 넘어온 파일 객체
     * @param folderName 저장할 폴더명 (예: "products", "users")
     * @return 업로드된 파일의 공개 URL 문자열
     */
    public String uploadFile(MultipartFile multipartFile, String folderName) {
        // 1. 원본 파일명 추출
        String originalFileName = multipartFile.getOriginalFilename();

        // 2. 파일명 중복 방지를 위한 UUID 생성 및 적용
        // 예: 고기.jpg -> 3f9a2b-1c4d..._고기.jpg
        String uniqueFileName = folderName + "/" + UUID.randomUUID().toString() + "_" + originalFileName;

        // 3. 파일의 메타데이터(크기, 타입 등) 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(multipartFile.getSize());
        metadata.setContentType(multipartFile.getContentType());

        try (InputStream inputStream = multipartFile.getInputStream()) {
            // 4. 업로드 요청 객체 생성 (버킷명, 저장될 파일명, 파일데이터, 메타데이터)
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, uniqueFileName, inputStream, metadata)
                    // 🔥 핵심: 프론트엔드에서 엑스박스가 뜨지 않도록 파일에 '공개 읽기' 권한을 부여합니다.
                    .withCannedAcl(CannedAccessControlList.PublicRead);

            // 5. 네이버 클라우드로 파일 전송 실행!
            amazonS3.putObject(putObjectRequest);

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }

        // 6. 업로드 성공 후, 프론트엔드나 DB에 저장할 수 있도록 완전한 이미지 URL을 생성하여 반환합니다.
        // 예: https://kr.object.ncloudstorage.com/버킷이름/products/고기.jpg
        return amazonS3.getUrl(bucketName, uniqueFileName).toString();
    }
}