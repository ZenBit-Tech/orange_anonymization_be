#######################################
new word_counts table created
######################################
it is supposed to store count of all terms for each user
######################################
insert/update example:
    insert into word_counts (user_id,word,count) values ('user_id','word','new_count')
    on dublicate key update 
    count = count + new_count
######################################
dashboard query:
    select word,count from word_counts where user_id = 'user_id';
    