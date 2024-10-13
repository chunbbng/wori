package team.woo.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import team.woo.algorithm.TaskAllocation;
import team.woo.algorithm.TaskType;
import team.woo.algorithm.TaskTypeRepository;
import team.woo.domain.Schedule;
import team.woo.domain.ScheduleRepository;
import team.woo.domain.ScheduleService;
import team.woo.member.Member;
import team.woo.session.SessionManager;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final SessionManager sessionManager;
    private final ScheduleRepository repository;
    private final TaskTypeRepository taskTypeRepository;  // TaskTypeRepository 추가

    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    @GetMapping("/create")
    public String add() {
        return "create";
    }

    @PostMapping("/create")
    public String addSchedule(
            @RequestParam("name") String name,
            @RequestParam("difficulty") int difficulty,
            @RequestParam("urgency") int urgency,
            @RequestParam("importance") int importance,
            @RequestParam("stress") int stress,
            @RequestParam("taskType") String taskTypeName,  // 여기에서 TaskType의 이름을 문자열로 받습니다.
            @RequestParam("estimatedTime") double estimatedTime,  // 예상 소요 시간 추가
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {

        // 세션에서 로그인된 사용자 정보를 가져옴
        Member loginMember = (Member) sessionManager.getSession(request, "member");
        // TaskType 엔티티를 이름을 기준으로 조회
        TaskType taskType = taskTypeRepository.findByName(taskTypeName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task type: " + taskTypeName));

        Schedule schedule;

        if (loginMember != null) {
            schedule = new Schedule(name, difficulty, importance, urgency, stress, loginMember.getId(), taskType, estimatedTime);
        } else {
            schedule = new Schedule(name, difficulty, importance, urgency, stress, taskType, estimatedTime);
        }

        Schedule savedSchedule = scheduleService.saveSchedule(schedule, loginMember != null ? loginMember.getId() : null);

        redirectAttributes.addAttribute("id", savedSchedule.getId());

        // 세션에 스케줄 ID 저장
        HttpSession session = request.getSession();
        session.setAttribute("scheduleId", savedSchedule.getId());

        return "redirect:/result/{id}";  // result 페이지로 이동
    }

    @GetMapping("/result/{id}")
    public String showResult(@PathVariable Long id, Model model, HttpServletRequest request) {
        Schedule schedule = scheduleService.getSchedule(id);
        model.addAttribute("schedule", schedule);

        // 세션에서 로그인된 사용자 정보를 가져옴
        Member loginMember = (Member) sessionManager.getSession(request, "member");
        model.addAttribute("loginMember", loginMember);

        // adjustTime 값을 뷰에 추가
        model.addAttribute("adjustTime", schedule.getAdjustTime());

        return "result";
    }

    @GetMapping("/select/{id}")
    public String task(@PathVariable Long id, Model model, HttpServletRequest request) {
        // 세션에서 Member 객체를 가져옵니다.
        Member loginMember = (Member) sessionManager.getSession(request, "member");

        if (loginMember != null) {
            logger.info("사용자 세션 확인: 사용자 ID = {}", loginMember.getId());
        } else {
            logger.info("비로그인 상태에서 접근: 세션이 없습니다.");
        }

        Schedule schedule = scheduleService.getSchedule(id);
        model.addAttribute("schedule", schedule);
        model.addAttribute("loginMember", loginMember);
        return "select";
    }

    @PostMapping("/select")
    public String selectOption(@RequestParam("option") String option,
                               @RequestParam("id") Long id,
                               HttpServletRequest request,
                               RedirectAttributes redirectAttributes) {

        Schedule schedule = scheduleService.getSchedule(id);
        Member loginMember = (Member) sessionManager.getSession(request, "member");

        schedule.setOption(option);

        int totalScore = TaskAllocation.calculateTotalScore(schedule.getDifficulty(), schedule.getUrgency(), schedule.getImportance(), schedule.getStress());

//        int availableDays = (int) (deadLine.toEpochDay() - startTime.toEpochDay());
//        int adjustDays = TaskAllocation.calculateAdjustDays(availableDays, option);
        double adjustTime = TaskAllocation.calculateAdjustTime(totalScore);

//        schedule.setAdjustDays(adjustDays);
        schedule.setAdjustTime(adjustTime);

        if (loginMember != null && schedule.getMember() == null) {
            schedule.setMember(loginMember);
        }

        scheduleService.updateSchedule(schedule);

        redirectAttributes.addAttribute("id", id);
        return "redirect:/result_ts/{id}";
    }

    @GetMapping("/schedule/{scheduleId}")
    public String schedule(@PathVariable Long scheduleId, Model model) {
        Schedule schedule = repository.findScheduleById(scheduleId);
        log.info("schedule={}", schedule.getName());
        model.addAttribute("schedule", schedule);
        return "scheduleInfo";
    }
}