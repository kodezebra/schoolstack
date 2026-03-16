CREATE TABLE `academic_years` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fee_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`fee_structure_id` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_date` integer NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_no` text,
	`receipt_no` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fee_structures` (
	`id` text PRIMARY KEY NOT NULL,
	`grade_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount` integer NOT NULL,
	`due_date` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`academic_year_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_no` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'teacher' NOT NULL,
	`department` text,
	`qualifications` text,
	`experience` text,
	`status` text DEFAULT 'active' NOT NULL,
	`join_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_employee_no_unique` ON `staff` (`employee_no`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`admission_no` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`gender` text NOT NULL,
	`dob` integer,
	`grade_id` text NOT NULL,
	`roll_no` text,
	`parent_name` text NOT NULL,
	`parent_phone` text NOT NULL,
	`parent_email` text,
	`address` text,
	`status` text DEFAULT 'active' NOT NULL,
	`enrollment_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_admission_no_unique` ON `students` (`admission_no`);