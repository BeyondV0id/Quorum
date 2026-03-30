CREATE TABLE "answer_upvotes" (
	"answer_uid" uuid NOT NULL,
	"username" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"question_uid" uuid NOT NULL,
	"time_created" timestamp DEFAULT now(),
	"author" text NOT NULL,
	"upvotes_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "space_members" (
	"space_uid" uuid NOT NULL,
	"username" text NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"creator_username" text,
	"created_at" timestamp DEFAULT now(),
	"color_index" integer DEFAULT 0,
	CONSTRAINT "spaces_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_username" text NOT NULL,
	"actor_username" text,
	"type" text NOT NULL,
	"reference_uid" uuid NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "question_upvotes" (
	"username" text NOT NULL,
	"question_uid" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time_created" timestamp DEFAULT now(),
	"content" text,
	"author" text NOT NULL,
	"space_uid" uuid NOT NULL,
	"upvotes_count" integer DEFAULT 0,
	"accepted_answer_uid" uuid,
	"pinned_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text DEFAULT 'Wanderer';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "links" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "posted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "answered" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "answer_upvotes" ADD CONSTRAINT "answer_upvotes_answer_uid_answers_uid_fk" FOREIGN KEY ("answer_uid") REFERENCES "public"."answers"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_upvotes" ADD CONSTRAINT "answer_upvotes_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_uid_questions_uid_fk" FOREIGN KEY ("question_uid") REFERENCES "public"."questions"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_author_user_username_fk" FOREIGN KEY ("author") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_uid_spaces_uid_fk" FOREIGN KEY ("space_uid") REFERENCES "public"."spaces"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_creator_username_user_username_fk" FOREIGN KEY ("creator_username") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_username_user_username_fk" FOREIGN KEY ("user_username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_username_user_username_fk" FOREIGN KEY ("actor_username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_upvotes" ADD CONSTRAINT "question_upvotes_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_upvotes" ADD CONSTRAINT "question_upvotes_question_uid_questions_uid_fk" FOREIGN KEY ("question_uid") REFERENCES "public"."questions"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_user_username_fk" FOREIGN KEY ("author") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_space_uid_spaces_uid_fk" FOREIGN KEY ("space_uid") REFERENCES "public"."spaces"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");