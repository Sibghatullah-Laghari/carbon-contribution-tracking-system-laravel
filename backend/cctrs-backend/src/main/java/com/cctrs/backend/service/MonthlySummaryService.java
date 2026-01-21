public MonthlyStatusDto calculateMonthlyStatus(User user, String month) {

    List<Activity> approvedActivities =
            activityRepository.findByUserAndMonthAndStatus(
                    user, month, "APPROVED"
            );

    int totalPoints = approvedActivities
            .stream()
            .mapToInt(Activity::getPoints)
            .sum();

    String status = (totalPoints > 0) ? "Improving" : "Stable";

    MonthlySummary summary = new MonthlySummary(
            user,
            month,
            totalPoints,
            status
    );

    summaryRepository.save(summary);

    return new MonthlyStatusDto(totalPoints, status);
}
