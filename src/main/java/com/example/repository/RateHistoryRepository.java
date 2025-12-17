package com.example.repository;
import com.example.entity.RateHistory;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import java.time.Instant;
import java.util.List;
@Repository
public interface RateHistoryRepository extends CrudRepository<RateHistory, Long> {
    /**
     * Find all rates from the last 24 hours, ordered by timestamp ascending
     */
    List<RateHistory> findByTimestampGreaterThanOrderByTimestampAsc(Instant timestamp);

    /**
     * Find all rates after a specific timestamp, ordered by timestamp ascending
     */
    List<RateHistory> findByTimestampAfter(Instant timestamp);

    /**
     * Count records to check if history exists
     */
    long count();
}
